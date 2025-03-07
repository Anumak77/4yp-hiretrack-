from flask import request, jsonify, Blueprint
from firebase_admin import firestore
from datetime import datetime
import requests
from datetime import datetime

seekeractions_bp = Blueprint('seekeractions', __name__)

@seekeractions_bp.route('/save-job', methods=['POST'])
def save_job():
    try:
        data = request.json
        user_id = data.get('userId')
        job = data.get('job')

        if not user_id or not job:
            return jsonify({"error": "User ID and job data are required"}), 400

        # Save the job to the user's savedjobs collection
        firestore_db = firestore.client()
        job_id = job.get('id') or f"{job.get('Company')}-{job.get('Title')}".replace(" ", "-").lower()
        job_ref = firestore_db.collection(f'jobseekers/{user_id}/savedjobs').document(job_id)

        # Check if the job already exists
        if job_ref.get().exists:
            return jsonify({"success": False, "message": "Job already saved"}), 200

        # Save the job
        job_ref.set({
            **job,
            "savedAt": datetime.now().isoformat(),
            "applicationstatus": "NA"
        })

        return jsonify({"success": True, "message": "Job saved successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@seekeractions_bp.route('/apply-job', methods=['POST'])
def apply_job():
    try:
        firestore_db = firestore.client()
        data = request.json
        user_id = data.get('userId')
        job = data.get('job')
        recruiter_id = job.get('recruiterId')

        if not user_id or not job or not recruiter_id:
            return jsonify({"error": "User ID, job data, and recruiter ID are required"}), 400

        # Fetch the user's CV
        cv_ref = firestore_db.collection(f'jobseekers/{user_id}/cv').document('cvFile')
        cv_snap = cv_ref.get()

        if not cv_snap.exists:
            return jsonify({
        "error": "No CV found for the user",
        "debug": f"Checked path: jobseekers/{user_id}/cv/cvFile"}), 404

        cv_base64 = cv_snap.to_dict().get('fileData')

         # Handle CV data splitting safely
        cv_parts = cv_base64.split(',')
        if len(cv_parts) > 1:
            cv_data = cv_parts[1]  # Use the part after the comma
        else:
            cv_data = cv_base64 

        # Compare CV with job description (optional)
        response = requests.post('http://127.0.0.1:5000/compare_with_description', json={
            "JobDescription": job.get('JobDescription'),
            "JobRequirment": job.get('JobRequirment', ""),
            "RequiredQual": job.get('RequiredQual', ""),
            "cv": cv_data,
        })

        similarity_score = response.json().get('cosine similarity', 0)
        match_score = round(similarity_score * 100, 2)

        job_id = job.get('id') or f"{job.get('Company')}-{job.get('Title')}".replace(" ", "-").lower()
        job_ref = firestore_db.collection(f'jobseekers/{user_id}/appliedjobs').document(job_id)
        job_ref.set({
            **job,
            "savedAt": datetime.now().isoformat(),
            "matchScore": match_score,
            "applicationstatus": "applied"
        })

        recruiter_job_ref = firestore_db.collection(f'recruiters/{recruiter_id}/jobposting/{job_id}'/'applicants').document(user_id)
        recruiter_job_ref.set({
            "userId": user_id,
            "appliedAt": datetime.now().isoformat(),
        })


        recruiter_ref = firestore_db.collection(f'recruiters/{recruiter_id}/applicantsnum').document('metadata')
        recruiter_ref.update({
            "applicantsnum": firestore.Increment(1)
        })


        return jsonify({"success": True, "message": "Job applied successfully", "matchScore": match_score}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
@seekeractions_bp.route('/withdraw-job', methods=['POST'])
def withdraw_job():
    try:
        data = request.json
        user_id = data.get('userId')
        job_id = data.get('jobId')
        recruiter_id = data.get('recruiterId')

        if not user_id or not job_id or not recruiter_id:
            return jsonify({"error": "User ID, job ID, and recruiter ID are required"}), 400

        # Delete the job from the user's appliedjobs collection
        firestore_db = firestore.client()
        job_ref = firestore_db.collection(f'jobseekers/{user_id}/appliedjobs').document(job_id)
        job_ref.delete()

        # Delete the user from the recruiter's jobposting collection
        recruiter_job_ref = firestore_db.collection(f'recruiters/{recruiter_id}/jobposting/{job_id}/applicants').document(user_id)
        recruiter_job_ref.delete()

        # Decrement the number of applicants for the recruiter
        recruiter_ref = firestore_db.collection(f'recruiters/{recruiter_id}').document('metadata')
        recruiter_ref.update({
            "applicantsnum": firestore.Increment(-1)
        })

        return jsonify({"success": True, "message": "Application withdrawn successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500