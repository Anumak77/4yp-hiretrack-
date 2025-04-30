from flask import Flask, jsonify, request, Blueprint
import firebase_admin
from flask_cors import cross_origin
from firebase_admin import credentials, firestore, auth
from firebase_admin.exceptions import FirebaseError  # Import FirebaseError
from datetime import datetime
from fuzzywuzzy import process
from config import firestore_db, realtime_db 

seeker_dashboard_bp = Blueprint('seeker_dashboard', __name__)

@seeker_dashboard_bp.route('/fetch-jobseeker-jobs/<job_list>', methods=['GET'])
@cross_origin()
def fetch_jobseeker_jobs(job_list):
    try:
        
        id_token = request.headers.get('Authorization')
        if not id_token:
            return jsonify({"error": "Authorization token is required"}), 401

        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token.get('uid')
        
        firestore_db = firestore.client()

        collection_ref = firestore_db.collection('jobseekers').document(uid).collection(job_list)

        docs = collection_ref.stream()

        jobs = []
        for doc in docs:
            jobs.append({ "id": doc.id, **doc.to_dict() })

        return jsonify(jobs), 200

    except FirebaseError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@seeker_dashboard_bp.route('/move-job', methods=['POST', 'OPTIONS'])
@cross_origin() 
def move_job():
    if request.method == 'OPTIONS':
        # Handle preflight request
        return jsonify({"success": True}), 200
    try:
        id_token = request.headers.get('Authorization')
        if not id_token:
            return jsonify({"error": "Authorization token is required"}), 401

        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token.get('uid')

        data = request.json
        if not data:
            return jsonify({"error": "Job data is required"}), 400

        job_id = data.get('job_id')
        source_collection = data.get('source_collection')
        target_collection = data.get('target_collection')

        source_ref = firestore_db.collection(f'jobseekers/{uid}/{source_collection}').document(job_id)
        job_data = source_ref.get().to_dict()

        if not job_data:
            return jsonify({"error": "Job not found in source collection"}), 404

        target_ref = firestore_db.collection(f'jobseekers/{uid}/{target_collection}').document(job_id)
        target_ref.set(job_data)

        source_ref.delete()

        return jsonify({"success": True}), 200

    except FirebaseError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
