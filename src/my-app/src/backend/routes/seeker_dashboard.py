from flask import Flask, jsonify, request, Blueprint
import firebase_admin
from flask_cors import cross_origin
from firebase_admin import credentials, firestore, auth
from firebase_admin.exceptions import FirebaseError  # Import FirebaseError
from datetime import datetime
from fuzzywuzzy import process

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
        jobs_ref = firestore_db.collection(f'jobseekers/{uid}/{job_list}')
        jobs_snapshot = jobs_ref.get()

        if not jobs_snapshot:
            jobs_ref.document().set({})
            jobs_snapshot = jobs_ref.get()

        jobs = []
        for doc in jobs_snapshot:
            jobs.append({ "id": doc.id, **doc.to_dict() })

        return jsonify(jobs), 200

    except FirebaseError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

