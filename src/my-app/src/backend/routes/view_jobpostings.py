from flask import Flask, jsonify, request, Blueprint
import firebase_admin
from flask_cors import cross_origin
from firebase_admin import credentials, firestore, auth
from firebase_admin.exceptions import FirebaseError  # Import FirebaseError
from datetime import datetime
from fuzzywuzzy import process
from config import firestore_db, realtime_db 

view_jobpostings_bp = Blueprint('view_jobpostings', __name__)

@view_jobpostings_bp.route('/fetch_job/<user_id>/<job_id>', methods=['GET', 'OPTIONS'])
@cross_origin()
def fetch_job(user_id, job_id):
    try:
        
        job_ref = firestore_db.collection('recruiters').document(user_id).collection('jobposting').document(job_id)
        job = job_ref.get()

        if not job.exists:
            return jsonify({"error": "Job not found"}), 404

        return jsonify(job.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@view_jobpostings_bp.route('/update_job/<user_id>/<job_id>', methods=['PUT', 'OPTIONS'])
@cross_origin()
def update_job(user_id, job_id):
    try:
        updated_data = request.json

        job_ref = firestore_db.collection('recruiters').document(user_id).collection('jobposting').document(job_id)
        job_ref.update(updated_data)

        return jsonify({"success": True, "message": "Job updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@view_jobpostings_bp.route('/fetch-jobs', methods=['GET'])
def fetch_jobs():
    try:
        
        id_token = request.headers.get('Authorization')
        if not id_token:
            return jsonify({"error": "Authorization token is required"}), 401

        
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token.get('uid')

        jobs_ref = firestore_db.collection(f'recruiters/{uid}/jobposting')
        jobs_snapshot = jobs_ref.get()

        jobs = []
        for doc in jobs_snapshot:
            jobs.append({ "id": doc.id, **doc.to_dict() })

        return jsonify(jobs), 200

    except FirebaseError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@view_jobpostings_bp.route('/delete-job/<job_id>', methods=['DELETE'])
def delete_job(job_id):
    try:
        id_token = request.headers.get('Authorization')
        if not id_token:
            return jsonify({"error": "Authorization token is required"}), 401

        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token.get('uid')

        job_ref = firestore_db.collection(f'recruiters/{uid}/jobposting').document(job_id)
        job_ref.delete()

        return jsonify({"success": True}), 200

    except FirebaseError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@view_jobpostings_bp.route('/add-tag', methods=['POST'])
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

@view_jobpostings_bp.route('/remove-tag', methods=['POST'])
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
