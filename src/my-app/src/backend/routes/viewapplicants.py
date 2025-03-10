from flask import Flask, jsonify, request, Blueprint
import firebase_admin
from firebase_admin import credentials, db
from config import firestore_db, realtime_db 
from fuzzywuzzy import process
from datetime import datetime

app = Flask(__name__)

viewapplicants_bp = Blueprint('viewapplicants', __name__)
cred = credentials.Certificate("firebase_service_account_key.json")

@viewapplicants_bp.route('/add-tag', methods=['POST'])
def add_tag():
    try:
        data = request.json
        job_id = data.get('job_id')
        new_tag = data.get('tag')

        if not job_id or not new_tag:
            return jsonify({"error": "job_id and tag are required"}), 400

        # Reference to the job posting document
        job_ref = firestore_db.collection('jobposting').document(job_id)
        job_doc = job_ref.get()

        if not job_doc.exists:
            return jsonify({"error": "Job posting not found"}), 404

        # Get the current tags
        current_tags = job_doc.to_dict().get('tags', [])

        # Add the new tag
        updated_tags = current_tags + [new_tag]

        # Update the document
        job_ref.update({
            "tags": updated_tags
        })

        return jsonify({
            "success": True,
            "job_id": job_id,
            "tags": updated_tags
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@viewapplicants_bp.route('/remove-tag', methods=['POST'])
def remove_tag():
    try:
        data = request.json
        job_id = data.get('job_id')
        tag_to_remove = data.get('tag')

        if not job_id or not tag_to_remove:
            return jsonify({"error": "job_id and tag are required"}), 400

        # Reference to the job posting document
        job_ref = firestore_db.collection('jobposting').document(job_id)
        job_doc = job_ref.get()

        if not job_doc.exists:
            return jsonify({"error": "Job posting not found"}), 404

        # Get the current tags
        current_tags = job_doc.to_dict().get('tags', [])

        # Remove the tag
        updated_tags = [tag for tag in current_tags if tag != tag_to_remove]

        # Update the document
        job_ref.update({
            "tags": updated_tags
        })

        return jsonify({
            "success": True,
            "job_id": job_id,
            "tags": updated_tags
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500