from flask import Blueprint, request, jsonify
from firebase_admin import firestore
from firebase_admin.exceptions import FirebaseError
from firebase_admin import credentials, initialize_app, auth, firestore
from datetime import datetime
from firebase_admin import db
from config import firestore_db, realtime_db 

cred = credentials.Certificate('firebase_service_account_key.json')

recruiterdash_bp = Blueprint('recruiterdash', __name__)

@recruiterdash_bp.route('/numjobpostings', methods=['GET'])
def num_jobpostings():
    try:
        recruiter_id = request.args.get('recruiter_id')
        if not recruiter_id:
            return jsonify({"error": "recruiter_id is required"}), 400
        
        job_postings_ref = firestore_db.collection(f'recruiters/{recruiter_id}/jobposting')

        
        job_postings_count = len(list(job_postings_ref.stream()))

        return jsonify({
            "success": True,
            "recruiter_id": recruiter_id,
            "num_jobpostings": job_postings_count
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@recruiterdash_bp.route('/numapplicants', methods=['GET'])
def num_applicants():
    try:
        recruiter_id = request.args.get('recruiter_id')
        if not recruiter_id:
            return jsonify({"error": "recruiter_id is required"}), 400
        
        # Correct Firestore path
        doc_ref = firestore_db.collection(f'recruiters/{recruiter_id}/applicantsum').document('metadata')
        doc = doc_ref.get()

        if doc.exists:
            total_applicants = doc.to_dict().get('applicantsnum', 0)
        else:
            total_applicants = 0

        return jsonify({
            "success": True,
            "recruiter_id": recruiter_id,
            "total_applicants": total_applicants
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


