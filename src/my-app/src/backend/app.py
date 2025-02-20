from flask import Flask, request, jsonify
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import base64
import requests
import PyPDF2
from rapidfuzz import process
import pandas as pd 
from io import BytesIO
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, db
from PyPDF2 import PdfReader
import io
from routes.auth import auth_bp  

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_bp)

FIREBASE_DATABASE_URL = "https://hiretrack-7b035-default-rtdb.europe-west1.firebasedatabase.app/"

def fetch_jobs_from_firebase():
    """Fetch jobs data from Firebase Realtime Database using REST API."""
    response = requests.get(FIREBASE_DATABASE_URL)
    if response.status_code == 200:
        jobs_data = response.json()
        return list(jobs_data.values()) if jobs_data else []
    else:
        raise Exception(f"Error fetching data from Firebase: {response.status_code}")


def decode_pdf(base64_pdf):
    try:
        # Decode the Base64 string
        pdf_bytes = base64.b64decode(base64_pdf)
        pdf_reader = PdfReader(io.BytesIO(pdf_bytes))

        # Extract text from all pages
        text = ''
        for page in pdf_reader.pages:
            text += page.extract_text()

        return text.strip()
    except Exception as e:
        raise ValueError(f"Error decoding PDF: {str(e)}")


'''
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
'''

@app.route('/compare_with_description', methods=['GET','POST'])
def compare_with_description():
    if request.method == 'POST':
        try:
            data = request.json
            job_description = data.get('JobDescription') 
            job_requirements = data.get('JobRequirment', '')
            requirement_qual = data.get('RequiredQual', '')
            cv_base64 = data.get('cv')  

            combined_job_description = f"{job_description}\n\n{job_requirements}\n\n{requirement_qual}"

            if not combined_job_description or not cv_base64:
                return jsonify({"error": "Job description and CV are required"}), 400
            
            try:
                user_cv_text = decode_pdf(cv_base64)
            except ValueError as e:
                return jsonify({"error": str(e)}), 400
            
            if not user_cv_text.strip() or not combined_job_description.strip():
                    return jsonify({"error": "Job description or CV is empty"}), 40

            vectorizer = TfidfVectorizer().fit_transform([user_cv_text, job_description])
            similarity_score = cosine_similarity(vectorizer[0], vectorizer[1])[0][0]

            return jsonify({"cosine similarity": similarity_score}), 200

        except Exception as e:
            print(f"Error in compare_with_description: {str(e)}")
            return jsonify({"error": "Internal Server Error"}), 500
    elif request.method == 'GET':
        # Handle GET request (for debugging)
        return jsonify({"message": "GET request received. Use POST to compare CV with job description."}), 200

if __name__ == '__main__':
    app.run(port=5000)