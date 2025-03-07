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
from routes.cv import cv_bp 
from routes.seekersearch import seekersearch_bp 
from routes.seekeractions import seekeractions_bp
from routes.recruiterdashboard import recruiterdash_bp
from routes.recruitersearch import recruitersearch_bp
from routes.edit_job import edit_job_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_bp)
app.register_blueprint(cv_bp)
app.register_blueprint(seekersearch_bp)
app.register_blueprint(seekeractions_bp)
app.register_blueprint(recruiterdash_bp)
app.register_blueprint(recruitersearch_bp)
app.register_blueprint(edit_job_bp)


FIREBASE_DATABASE_URL = "https://hiretrack-7b035-default-rtdb.europe-west1.firebasedatabase.app/"

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

        return text.strip(), jsonify({base64_pdf})
    except Exception as e:
        raise ValueError(f"Error decoding PDF: {str(e)}")

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
                    return jsonify({"error": "Job description or CV is empty"}), 400

            vectorizer = TfidfVectorizer().fit_transform([user_cv_text, combined_job_description])
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