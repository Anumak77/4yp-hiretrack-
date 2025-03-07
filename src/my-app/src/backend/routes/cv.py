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
import base64
from io import BytesIO
from PyPDF2 import PdfReader


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
        job_description = data.get('JobDescription')
        job_requirements = data.get('JobRequirment', '')
        requirement_qual = data.get('RequiredQual', '')
        cv_base64 = data.get('cv')

        # Combine job description, requirements, and qualifications
        combined_job_description = f"{job_description}\n\n{job_requirements}\n\n{requirement_qual}"

        # Validate input
        if not combined_job_description or not cv_base64:
            return jsonify({"error": "Job description and CV are required"}), 400

        try:
            # Decode the CV PDF and extract text
            user_cv_text = decode_pdf(cv_base64)
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

        # Validate extracted text
        if not user_cv_text.strip() or not combined_job_description.strip():
            return jsonify({"error": "Job description or CV is empty"}), 400

        # Calculate cosine similarity
        vectorizer = TfidfVectorizer().fit_transform([user_cv_text, combined_job_description])
        similarity_score = cosine_similarity(vectorizer[0], vectorizer[1])[0][0]

        return jsonify({"cosine_similarity": similarity_score}), 200

    except Exception as e:
        print(f"Error in compare_with_description: {str(e)}")
        return jsonify({"error": "Internal Server Error"}), 500