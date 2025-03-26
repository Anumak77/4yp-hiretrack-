import re
import os
from docx import Document
import fitz  # PyMuPDF
import spacy
from collections import Counter

nlp = spacy.load("en_core_web_sm")

# --- Patterns ---
patterns = {
    'name': re.compile(
        r'^(?!.*\b(?:Location|Phone|Email|Address|Status|Summary|Skills|Objective|Current)\b)'
        r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)',
        re.MULTILINE
    ),
    'location': re.compile(
        r'Current Location\s*[:\-]?\s*([A-Za-z\s,]+)(?=\s|$)|'
        r'Location\s*[:\-]?\s*([A-Za-z\s,]+)(?=\s|$)|'
        r'^[A-Za-z\s]+,\s*[A-Za-z]+(?=\s+\|)',
        re.MULTILINE | re.IGNORECASE
    ),
    'experience': re.compile(
        r'^SUMMARY\s*:?\s*(.*?)(?=^TECHNICAL SKILLS|^EDUCATION|^Client:|^$)|'
        r'^PROFESSIONAL SUMMARY\s+(.*?)(?=^TECHNICAL SKILLS|^EDUCATION|^Client:|^$)|'
        r'^PROFESSIONAL EXPERIENCE\s+(.*?)(?=^TECHNICAL SKILLS|^EDUCATION|^Client:|^$)|'
        r'^Client:\s+(.*?)(?=^Client:|^EDUCATION|^TECHNICAL SKILLS|^$)',
        re.DOTALL | re.MULTILINE | re.IGNORECASE
    ),
    'experience_structured': re.compile(
        r'(?:Client|Employer|Company):?\s*(.*?)\s*(?:Role|Position|Title):?\s*(.*?)(?=(?:Client|Employer|Company|EDUCATION|TECHNICAL SKILLS|$))',
        re.DOTALL | re.IGNORECASE
    ),
    'education': re.compile(
        r'^EDUCATION\s+(.*?)(?=^RELEVANT EXPERIENCE|^PROJECTS|^SKILLS|^TECHNICAL SKILLS|^Client:|^$)|'
        r'Education:\s*(.*?)$',
        re.DOTALL | re.MULTILINE | re.IGNORECASE
    ),
    'skills': re.compile(
        r'^TECHNICAL SKILLS\s*:?\s*(.*?)(?=^PROFESSIONAL EXPERIENCE|^EXPERIENCE|^EDUCATION|^Client:|^$)|'
        r'Skills:\s*(.*?)(?=Interests|Languages|$)|'
        r'^SKILLS\s*(.*?)(?=^\s*$|^EDUCATION|^CAREER PROGRESSION|^\Z)',
        re.DOTALL | re.MULTILINE | re.IGNORECASE
    )
}

def clean_text(text):
    cleaned_text = text.replace('\xa0', ' ')
    cleaned_text = cleaned_text.replace('\uf0b7', '')
    cleaned_text = cleaned_text.replace('\u2022', '')
    cleaned_text = cleaned_text.replace('\u25AA', '')
    cleaned_text = cleaned_text.replace('\uf06e', '')
    cleaned_text = cleaned_text.replace('\n', ' ')
    return ' '.join(cleaned_text.split())

def extract_info(text, patterns, file_name=None):
    print("✨ using real parser 💅 from train_resume_parser.py")
    resume_info = {}

    for key, pattern in patterns.items():
        match = pattern.search(text)
        if match:
            captured = next((g for g in match.groups() if g), None)
            if captured:
                if key == 'experience':
                    resume_info[key] = clean_text(captured)
                elif key == 'experience_structured':
                    structured = re.findall(pattern, text)
                    if structured:
                        resume_info['experience'] = [{"client": clean_text(c), "role": clean_text(r)} for c, r, *_ in structured]
                elif key == 'location':
                    cleaned_loc = clean_text(captured)
                    cleaned_loc = re.sub(r'(Location:|Current Location:)', '', cleaned_loc, flags=re.IGNORECASE)
                    cleaned_loc = re.sub(r'\b(Visa|Status|Phone|Email)\b.*', '', cleaned_loc, flags=re.IGNORECASE)
                    resume_info[key] = cleaned_loc.strip()
                else:
                    resume_info[key] = clean_text(captured)
            else:
                resume_info[key] = 'Not found'
        else:
            resume_info[key] = 'Not found'

    name_extracted = False

    if not name_extracted and file_name:
        base = os.path.splitext(file_name)[0]
        base = re.sub(r'[^a-zA-Z\s_]', '', base)
        parts = re.split(r'[_\s]+', base)
        parts = [p for p in parts if p.istitle()]
        if len(parts) >= 2:
            resume_info["name"] = " ".join(parts[:2])
            name_extracted = True

    if not name_extracted:
        name_line = re.search(r'^Name[:\-]?\s*(.+)', text, re.MULTILINE)
        if name_line:
            possible_name = clean_text(name_line.group(1))
            if 1 <= len(possible_name.split()) <= 4 and all(w.istitle() for w in possible_name.split()):
                resume_info["name"] = possible_name
                name_extracted = True

    if not name_extracted:
        top_lines = "\n".join(text.splitlines()[:10])
        doc = nlp(top_lines)
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                candidate = ent.text.strip()
                if 1 <= len(candidate.split()) <= 3 and all(w.istitle() for w in candidate.split()):
                    resume_info["name"] = candidate
                    if resume_info.get("location"):
                        loc_words = resume_info["location"].split()
                        name_words = resume_info["name"].split()
                        if name_words and name_words[-1] in loc_words:
                            resume_info["name"] = " ".join(name_words[:-1])
                    name_extracted = True
                    break

    if not name_extracted:
        name_match = patterns['name'].search(text)
        if name_match:
            captured = next((g for g in name_match.groups() if g), None)
            if captured:
                resume_info["name"] = clean_text(captured)
                name_extracted = True

    if not name_extracted:
        lines = text.strip().split('\n')
        for line in reversed(lines[-10:]):
            line_clean = clean_text(line)
            words = line_clean.split()
            if 2 <= len(words) <= 4 and all(w.istitle() for w in words):
                resume_info["name"] = line_clean
                name_extracted = True
                break

    if not name_extracted:
        resume_info["name"] = "Not found"

    if resume_info.get("location") == 'Not found' or resume_info["location"].lower() in ("s in the", "", "not found"):
        doc = nlp(text)
        locations = [ent.text for ent in doc.ents if ent.label_ == "GPE"]
        if locations:
            most_common = Counter(locations).most_common(1)[0][0]
            resume_info["location"] = most_common
        else:
            resume_info["location"] = "Not found"

    if resume_info.get("education") == 'Not found':
        edu_keywords = ["University", "College", "Bachelor", "Master", "PhD", "Degree"]
        doc = nlp(text)
        for sent in doc.sents:
            if any(kw.lower() in sent.text.lower() for kw in edu_keywords):
                resume_info["education"] = clean_text(sent.text)
                break

    if resume_info.get("skills") == 'Not found':
        for ent in nlp(text).ents:
            if ent.label_ in ("ORG", "PRODUCT"):
                if any(skill_kw in ent.text.lower() for skill_kw in ["java", "python", "sql", "spring", "aws", "docker"]):
                    resume_info["skills"] = ent.text
                    break

    return resume_info

def read_docx(file_path):
    try:
        doc = Document(file_path)
        full_text = [para.text for para in doc.paragraphs if para.text.strip()]
        return '\n'.join(full_text)
    except Exception as e:
        print(f"[DOCX ERROR] {file_path}: {e}")
        return None

def read_pdf(file_path):
    try:
        with fitz.open(file_path) as doc:
            text = "\n".join(page.get_text() for page in doc)
        return text
    except Exception as e:
        print(f"[PDF ERROR] {file_path}: {e}")
        return None

def process_resumes(directory):
    resumes_info = []
    for file_name in os.listdir(directory):
        if file_name.startswith('.') or file_name.lower() == 'thumbs.db':
            continue
        file_path = os.path.join(directory, file_name)
        if file_name.endswith('.docx'):
            text = read_docx(file_path)
        elif file_name.endswith('.pdf'):
            text = read_pdf(file_path)
        else:
            print(f"[SKIP] Unsupported file type: {file_name}")
            continue
        if text:
            extracted = extract_info(text, patterns, file_name)
            resumes_info.append({'file': file_name, **extracted})
        else:
            print(f"[SKIP] Failed to extract text: {file_name}")
    return resumes_info

if __name__ == "__main__":
    data_dir = './resume_dataset/raw_data'
    all_resumes_data = process_resumes(data_dir)
    print(all_resumes_data)
