from flask import Flask, request, jsonify, Blueprint
from firebase_admin import firestore
from flask_cors import CORS, cross_origin
from config import firestore_db, realtime_db 

cred = credentials.Certificate('firebase_service_account_key.json')

edit_job_bp = Blueprint('edit_job', __name__)

@edit_job_bp.route('/fetch_job/<user_id>/<job_id>', methods=['GET', 'OPTIONS'])
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


@edit_job_bp.route('/update_job/<user_id>/<job_id>', methods=['PUT', 'OPTIONS'])
@cross_origin()
def update_job(user_id, job_id):
    try:
        updated_data = request.json

        job_ref = firestore_db.collection('recruiters').document(user_id).collection('jobposting').document(job_id)
        job_ref.update(updated_data)

        return jsonify({"success": True, "message": "Job updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

