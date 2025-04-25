from flask import Blueprint, request, jsonify
from firebase_admin import firestore, auth
from firebase_admin.exceptions import FirebaseError
import base64
from datetime import datetime
import base64
from io import BytesIO
from PyPDF2 import PdfReader
from flask import Flask, request, jsonify
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import spacy
from sentence_transformers import SentenceTransformer
import numpy as np
from rake_nltk import Rake
import re
import base64
from io import BytesIO
from PyPDF2 import PdfReader
import nltk
nltk.download('stopwords')
nltk.download('punkt_tab')

nlp = spacy.load("en_core_web_sm")  
sbert_model = SentenceTransformer('all-MiniLM-L6-v2')
rake = Rake()

cv_bp = Blueprint('cv', __name__)

@cv_bp.route('/save-pdf', methods=['POST'])
def save_pdf():
    try:
        id_token = request.headers.get('Authorization')
        if not id_token:
            return jsonify({"error": "Authorization token is required"}), 401

        # Verify the Firebase ID token
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token.get('uid')

        # Get the uploaded file data
        data = request.json
        if not data or 'file' not in data:
            return jsonify({"error": "File data is required"}), 400

        base64_file = data['file']

        # Save the base64 file to Firestore
        firestore_db = firestore.client()
        doc_ref = firestore_db.collection(f'users/{uid}/cv').document('cvFile')
        doc_ref2 = firestore_db.collection(f'jobseekers/{uid}/cv').document('cvFile')
        doc_ref.set({
            "fileData": base64_file,
            "uploadedAt": datetime.now().isoformat(),
        })
        doc_ref2.set({
            "fileData": base64_file,
            "uploadedAt": datetime.now().isoformat(),
        })

        return jsonify({"message": "File saved to Firestore"}), 200

    except FirebaseError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cv_bp.route('/fetch-pdf', methods=['GET'])
def fetch_pdf():
    try:
        id_token = request.headers.get('Authorization')
        if not id_token:
            return jsonify({"error": "Authorization token is required"}), 401

        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token.get('uid')

        # Fetch the CV file from Firestore
        firestore_db = firestore.client()
        doc_ref = firestore_db.collection(f'jobseekers/{uid}/cv').document('cvFile')
        doc_snap = doc_ref.get()

        if not doc_snap.exists:
            return jsonify({"error": "No CV found for user"}), 404

        file_data = doc_snap.to_dict().get('fileData')
        return jsonify({"fileData": file_data}), 200

    except FirebaseError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
def decode_pdf(base64_pdf):
    try:
        # Add padding if necessary
        padding = len(base64_pdf) % 4
        if padding:
            base64_pdf += '=' * (4 - padding)

        # Decode the base64 string
        pdf_bytes = base64.b64decode(base64_pdf)

        # Verify the PDF file
        pdf_reader = PdfReader(BytesIO(pdf_bytes))
        if not pdf_reader.pages:
            raise ValueError("PDF file is empty or invalid")

        # Extract text from all pages
        text = ''
        for page in pdf_reader.pages:
            text += page.extract_text()

        return text.strip()  # Return only the extracted text
    except Exception as e:
        raise ValueError(f"Error decoding PDF: {str(e)}")

@cv_bp.route('/compare_with_description', methods=['POST'])
def compare_with_description():
    try:
        data = request.json
        job_description = data.get('JobDescription', '')
        job_requirements = data.get('JobRequirment', '')
        requirement_qual = data.get('RequiredQual', '')
        cv_base64 = data.get('cv')

        # Handle CV data splitting safely
        cv_parts = cv_base64.split(',')
        if len(cv_parts) > 1:
            cv_base64 = cv_parts[1] 
            
        combined_job_description = f"{job_description}\n\n{job_requirements}\n\n{requirement_qual}"

        if not combined_job_description or not cv_base64:
            return jsonify({"error": "Job description and CV are required"}), 400

        try:
            user_cv_text = decode_pdf(cv_base64)
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

        # Validate extracted text
        if not user_cv_text.strip() or not combined_job_description.strip():
            return jsonify({"error": "Job description or CV is empty"}), 400
        
        # More advanced preprocessing
        def preprocess_text(text):
            doc = nlp(text)
            cleaned = [
                token.lemma_.lower() for token in doc 
                if not token.is_stop and token.is_alpha
            ]
            return " ".join(cleaned)

        job_desc_cleaned = preprocess_text(combined_job_description)
        cv_text_cleaned = preprocess_text(user_cv_text)

        # Extracct keywords 
        def extract_keywords(text):
            rake.extract_keywords_from_text(text)
            return rake.get_ranked_phrases()[:10]  # Top 10 keywords

        job_keywords = extract_keywords(combined_job_description)
        cv_keywords = extract_keywords(user_cv_text)

        # Calculate cosine similarity
        try:
            # 1. TF-IDF Cosine Similarity
            vectorizer = TfidfVectorizer()
            tfidf_matrix = vectorizer.fit_transform([cv_text_cleaned, job_desc_cleaned])
            tfidf_score = cosine_similarity(tfidf_matrix[0], tfidf_matrix[1])[0][0]
        except Exception as e:
            print(f"TF-IDF error: {str(e)}")
            tfidf_score = 0.0

        #SBERT (semantic similarity)
        job_embedding = sbert_model.encode([combined_job_description])[0]
        cv_embedding = sbert_model.encode([user_cv_text])[0]
        sbert_score = cosine_similarity([job_embedding], [cv_embedding])[0][0]

        # keyword overlap score
        keyword_overlap = len(set(job_keywords) & set(cv_keywords)) / max(len(set(job_keywords)), 1)

        def check_experience(job_desc, cv_text):
            match = re.search(r'(\d+)\+? years?', job_desc, re.IGNORECASE)
            if not match:
                return 1.0  # No explicit requirement assume they match
            required_years = int(match.group(1))
            cv_years = sum(int(num) for num in re.findall(r'(\d+) years?', cv_text, re.IGNORECASE))
            return min(cv_years / required_years, 1.0)

        experience_score = check_experience(combined_job_description, user_cv_text)

        final_score = (
            0.5 * sbert_score +  
            0.3 * tfidf_score + 
            0.1 * keyword_overlap + 
            0.1 * experience_score 
        ) #this all can be adjusted by the recruiter depending on their preferences 

        response = {
            "score": float(final_score),
            "score_breakdown": {
                "tfidf_cosine_similarity": float(tfidf_score),
                "semantic_similarity": float(sbert_score),
                "keyword_overlap": float(keyword_overlap),
                "experience_match": float(experience_score)
            },
            "matching_keywords": list(set(job_keywords) & set(cv_keywords)),
            "missing_keywords": list(set(job_keywords) - set(cv_keywords))
        }

        return jsonify({"cosine_similarity": final_score}), 200

    except Exception as e:
        print(f"Error in compare_with_description: {str(e)}")
        return jsonify({"error": "Internal Server Error"}), 500