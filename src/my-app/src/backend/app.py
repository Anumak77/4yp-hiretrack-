from flask import Flask, request, jsonify
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import base64
import PyPDF2
from rapidfuzz import process
import pandas as pd 
from io import BytesIO

app = Flask(__name__)

jobs_df = pd.read_csv('Online_Job_Posting_Database.csv')
jobs_df['JobRequirement'] = jobs_df['requirement'].fillna('')
jobs_df['title'] = jobs_df['title'].fillna('')

def decode_pdf(base64_pdf):
    pdf_bytes = base64.b64decode(base64_pdf.split(',')[1])
    pdf_reader = PyPDF2.PdfReader(BytesIO(pdf_bytes))
    text = ''
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text


#used fuzzy matching to filter out jobs as database is very large 
@app.route('/filter', methods=['GET'])
def filter_jobs():
    job_title = request.args.get('title', '').lower()
    if not job_title:
        return jsonify({"error": "Job title is required"}), 400
    
    titles = jobs_df['title'].tolist()
    matches = process.extract(job_title, titles, limit=10, scorer=process.fuzz.partial_ratio)
    matched_titles = [match[0] for match in matches if match[1] > 50]  
    filtered_jobs = jobs_df[jobs_df['title'].isin(matched_titles)]

    if filtered_jobs.empty:
        return jsonify({"message": "No jobs found for the given title"}), 404

    return jsonify({"jobs": filtered_jobs.to_dict(orient='records')}), 200

@app.route('/similarity', methods=['POST'])
def similarity():
    data = request.json
    text1_base64 = data.get('text1')  # User's CV in Base64
    job_title = data.get('title', '').lower()

    if not text1_base64 or not job_title:
        return jsonify({"error": "User CV and job title are required"}), 400

    # Decode the user's CV
    text1 = decode_pdf(text1_base64)

    # Filter jobs by title
    filtered_jobs = jobs_df[jobs_df['title'].str.lower().str.contains(job_title)]
    if filtered_jobs.empty:
        return jsonify({"error": "No jobs found for the given title"}), 404

    # Combine user CV with job descriptions
    texts = [text1] + filtered_jobs['description'].tolist()

    # Vectorize using Tfidf
    vectorizer = TfidfVectorizer(stop_words='english')
    vectors = vectorizer.fit_transform(texts)

    # Compute similarity between the user's CV and all filtered job descriptions
    user_cv_vector = vectors[0]  # First vector is the user's CV
    job_vectors = vectors[1:]  # Remaining vectors are job descriptions
    similarities = cosine_similarity(user_cv_vector, job_vectors).flatten()

    # Find the top 10 matches
    top_indices = np.argsort(similarities)[-20:][::-1]  # Get top 10 indices in descending order
    top_matches = filtered_jobs.iloc[top_indices]

    # Prepare the response
    response = top_matches.to_dict(orient='records')
    return jsonify({"matches": response}), 200

@app.route('/compare_with_description', methods=['POST'])
def compare_with_description():
    data = request.json
    job_description = data.get('job_description') 
    cv_base64 = data.get('cv')  

    if not job_description or not cv_base64:
        return jsonify({"error": "Job description and CV are required"}), 400

    user_cv_text = decode_pdf(cv_base64)

    vectorizer = TfidfVectorizer().fit_transform([user_cv_text, job_description])
    similarity_score = cosine_similarity(vectorizer[0], vectorizer[1])[0][0]

    return jsonify({"cosine similarity": similarity_score}), 200

if __name__ == '__main__':
    app.run(port=5000)