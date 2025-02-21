from flask import Blueprint, request, jsonify
from firebase_admin import firestore, auth
from firebase_admin.exceptions import FirebaseError
import base64
from datetime import datetime

# Create a Blueprint for CV-related routes
cv_bp = Blueprint('cv', __name__)

@cv_bp.route('/save-pdf', methods=['POST'])
def save_pdf():
    try:
        # Get the user ID from the request (e.g., from a token)
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
        doc_ref = firestore_db.collection(f'users/{uid}/cv').document('cvFile')
        doc_snap = doc_ref.get()

        if not doc_snap.exists:
            return jsonify({"error": "No CV found for user"}), 404

        file_data = doc_snap.to_dict().get('fileData')
        return jsonify({"fileData": file_data}), 200

    except FirebaseError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500