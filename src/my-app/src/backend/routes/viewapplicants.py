from flask import Flask, jsonify, request, Blueprint
import firebase_admin
from firebase_admin import credentials, db
from config import firestore_db, realtime_db 
from fuzzywuzzy import process
from datetime import datetime
from flask import Flask, jsonify, request, Blueprint
import firebase_admin
from firebase_admin import credentials, firestore, auth
from firebase_admin.exceptions import FirebaseError  # Import FirebaseError
from datetime import datetime
from fuzzywuzzy import process
from routes.notifications import notifications_bp
app = Flask(__name__)

viewapplicants_bp = Blueprint('viewapplicants', __name__)
cred = credentials.Certificate("firebase_service_account_key.json")

@viewapplicants_bp.route('/fetch-applicants/<recruiter_id>/<jobposting_id>', methods=['GET'])
def fetch_applicants(recruiter_id, jobposting_id):
    try:
        
        applicants_ref = firestore_db.collection(f'recruiters/{recruiter_id}/jobposting/{jobposting_id}/applicants')
        applicants = applicants_ref.stream()

        applicants_list = []
        for applicant in applicants:
            applicant_uid = applicant.id  
            user_ref = firestore_db.collection('users').document(applicant_uid)
            user_data = user_ref.get()

            if user_data.exists:
                user_data_dict = user_data.to_dict()
                applicants_list.append(user_data_dict)

        return jsonify({
            "success": True,
            "applicants": applicants_list,
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@viewapplicants_bp.route('/interview-applicants/<recruiter_id>/<jobposting_id>', methods=['GET'])
def interview_applicants(recruiter_id, jobposting_id):
    try:
 
        applicant_id = request.args.get('applicant_id')
        if not applicant_id:
            return jsonify({"error": "applicant_id is required"}), 400


        applicant_ref = firestore_db.collection('jobseekers').document(applicant_id)
        applicant_data = applicant_ref.get()

        if not applicant_data.exists:
            return jsonify({"error": "Applicant not found"}), 404

        job_posting_ref = firestore_db.collection('recruiters').document(recruiter_id).collection('jobposting').document(jobposting_id)
        job_posting_data = job_posting_ref.get()

        if not job_posting_data.exists:
            return jsonify({"error": "Job posting not found"}), 404

        interview_applicant_ref = firestore_db.collection('recruiters').document(recruiter_id).collection('jobposting').document(jobposting_id).collection('interviewapplicants').document(applicant_id)
        interview_applicant_ref.set(applicant_data.to_dict())

        interview_job_ref = firestore_db.collection('jobseekers').document(applicant_id).collection('interviewedjobs').document(jobposting_id)
        interview_job_ref.set(job_posting_data.to_dict())

        create_notification(applicant_id, f"You have been scheduled for an interview for Job ID: {job_id}.", job_id)

        return jsonify({
            "success": True,
            "message": "Applicant added to interview list",
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@viewapplicants_bp.route('/rejected-applicants/<recruiter_id>/<jobposting_id>', methods=['GET'])
def rejected_applicants(recruiter_id, jobposting_id):
    try:
 
        applicant_id = request.args.get('applicant_id')
        if not applicant_id:
            return jsonify({"error": "applicant_id is required"}), 400


        applicant_ref = firestore_db.collection('jobseekers').document(applicant_id)
        applicant_data = applicant_ref.get()

        if not applicant_data.exists:
            return jsonify({"error": "Applicant not found"}), 404

        job_posting_ref = firestore_db.collection('recruiters').document(recruiter_id).collection('jobposting').document(jobposting_id)
        job_posting_data = job_posting_ref.get()

        if not job_posting_data.exists:
            return jsonify({"error": "Job posting not found"}), 404
        
        interview_applicant_ref = firestore_db.collection('recruiters').document(recruiter_id).collection('jobposting').document(jobposting_id).collection('interviewapplicants').document(applicant_id)
        interview_applicant_data = interview_applicant_ref.get()

        if interview_applicant_data.exists:
            interview_applicant_ref.delete()

        rejected_applicant_ref = firestore_db.collection('recruiters').document(recruiter_id).collection('jobposting').document(jobposting_id).collection('rejectedapplicants').document(applicant_id)
        rejected_applicant_ref.set(applicant_data.to_dict())

        rejected_job_ref = firestore_db.collection('jobseekers').document(applicant_id).collection('rejectedjobs').document(jobposting_id)
        rejected_job_ref.set(job_posting_data.to_dict())

        create_notification(applicant_id, f"Your application for Job ID: {job_id} has been rejected.", job_id)

        return jsonify({
            "success": True,
            "message": "Applicant added to rejected list",
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@viewapplicants_bp.route('/fetch-interview-applicants/<recruiter_id>/<jobposting_id>', methods=['GET'])
def fetch_interview_applicants(recruiter_id, jobposting_id):
    try:
        # Fetch applicants in the "Interview" status
        interview_applicants_ref = firestore_db.collection(f'recruiters/{recruiter_id}/jobposting/{jobposting_id}/interviewapplicants')
        interview_applicants = interview_applicants_ref.stream()

        applicants_list = []
        for applicant in interview_applicants:
            applicant_data = applicant.to_dict()
            applicants_list.append(applicant_data)

        return jsonify({
            "success": True,
            "applicants": applicants_list,
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@viewapplicants_bp.route('/fetch-rejected-applicants/<recruiter_id>/<jobposting_id>', methods=['GET'])
def fetch_rejected_applicants(recruiter_id, jobposting_id):
    try:
        
        rejected_applicants_ref = firestore_db.collection(f'recruiters/{recruiter_id}/jobposting/{jobposting_id}/rejectedapplicants')
        rejected_applicants = rejected_applicants_ref.stream()

        applicants_list = []
        for applicant in rejected_applicants:
            applicant_data = applicant.to_dict()
            applicants_list.append(applicant_data)

        return jsonify({
            "success": True,
            "applicants": applicants_list,
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500