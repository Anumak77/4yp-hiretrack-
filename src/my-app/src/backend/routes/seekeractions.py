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

def fetch_user_cv(firestore_db, user_id):
    cv_ref = firestore_db.collection(f'jobseekers/{user_id}/cv').document('cvFile')
    cv_snap = cv_ref.get()

    if not cv_snap.exists:
        return None, {"error": "No CV found for the user", "debug": f"Checked path: jobseekers/{user_id}/cv/cvFile"}

    cv_base64 = cv_snap.to_dict().get('fileData')
    return cv_base64, None

def process_cv_data(cv_base64):
    cv_parts = cv_base64.split(',')
    if len(cv_parts) > 1:
        return cv_parts[1]  # Use the part after the comma
    return cv_base64  # Use the entire string if no comma is found

def compare_cv_with_job_description(job_description, job_requirements, required_qual, cv_data, jobId, recruiterId):

    response = requests.post('http://127.0.0.1:5000/compare_with_description', json={
        "JobDescription": job_description,
        "JobRequirment": job_requirements,
        "RequiredQual": required_qual,
        "cv": cv_data,
        "jobId": jobId,
        "recruiterId": recruiterId
    })

    if response.status_code != 200:
            return {
                "error": f"Comparison service returned {response.status_code}",
                "debug": response.text
            }, None
    
    print(response)
    result = response.json()
    return None, result
    

def save_job_application(firestore_db, user_id, job, application_data, job_id):
    job_ref = firestore_db.collection(f'jobseekers/{user_id}/appliedjobs').document(job_id)
    job_ref.set({
        **job,
        "savedAt": datetime.now().isoformat(),
        "application_data": application_data,
        "applicationstatus": "applied"
    })
    return job_id

def update_recruiter_metadata(firestore_db, recruiter_id, job_id, user_id, application_data):
    try:

        user_ref = firestore_db.collection('jobseekers').document(user_id)
        user_data = user_ref.get()

        if not user_data.exists:
            raise ValueError(f"User with ID {user_id} not found in jobseekers collection.")

        recruiter_job_ref = firestore_db.collection(f'recruiters/{recruiter_id}/jobposting/{job_id}/applicants').document(user_id)
        recruiter_job_ref.set({
            **user_data.to_dict(),
            "appliedAt": datetime.now().isoformat(),
            "application_data": application_data
        })
        recruiter_ref = firestore_db.collection(f'recruiters/{recruiter_id}/applicantsum').document('metadata')

        metadata_doc = recruiter_ref.get()

        if not metadata_doc.exists:
            recruiter_ref.set({
                "applicantsnum": 1  # Initialize with 1
            })

        recruiter_ref.update({
            "applicantsnum": firestore.Increment(1)
        })
        
        job_ref = firestore_db.collection(f'recruiters/{recruiter_id}/jobposting').document(job_id)
        job_doc = job_ref.get()

        if not job_doc.exists:
            job_ref.set({
                "applicantsnum": 1
            })
        else:
            job_ref.update({
                "applicantsnum": firestore.Increment(1)
            })
        print(f"Successfully updated recruiter metadata for recruiter {recruiter_id} and job {job_id}.")
        return True

    except Exception as e:
        print(f"Error updating recruiter metadata: {e}")
        return False


@seekeractions_bp.route('/apply-job', methods=['POST'])
def apply_job():
    try:
        firestore_db = firestore.client()
        data = request.json
        print(data)
        user_id = data.get('userId')
        job = data.get('job')
        recruiter_id = job.get('recruiterId')
        application_data = data.get('application_data')
        cv_data = None


        if not user_id or not job:
            return jsonify({"error": "User ID, job data, and recruiter ID are required"}), 400

        if not recruiter_id:
            recruiter_id = "recruiter_id"
        
        job_id = job.get('id') or f"{job.get('Company')}-{job.get('Title')}".replace(" ", "-").lower()
        
        applicant_ref = firestore_db.collection(f'recruiters/{recruiter_id}/jobposting/{job_id}/applicants').document(user_id)
        applicant_doc = applicant_ref.get()
        
        if applicant_doc.exists:
            return jsonify({"error": "User has already applied for this job"}), 200

        if application_data is None:
            cv_base64, error = fetch_user_cv(firestore_db, user_id)
            if error:
                return jsonify(error), 404
            cv_data = process_cv_data(cv_base64)
            error, comparison_result = compare_cv_with_job_description(
                job.get('Description', ''),
                job.get('Requirements', ''),
                job.get('RequiredQual', ''),
                cv_data,
                job_id,
                recruiter_id,
            )

            print(comparison_result)

            if error:
                return jsonify(error), 500

            application_data_temp = {
                "match_score": comparison_result.get('match_score', 0.0),
                "score_breakdown": comparison_result.get('score_breakdown', {}),
                "matching_keywords": comparison_result.get('matching_keywords', []),
                "missing_keywords": comparison_result.get('missing_keywords', [])
            }
        else:
            application_data = data.get('application_data')

        application_data = {
            "savedAt": datetime.now().isoformat(),
            "applicationstatus": "applied",
            **application_data_temp
        }


        # Save job application
        save_job_application(firestore_db, user_id, job, application_data, job_id)

        # Update recruiter metadata
        update_recruiter_metadata(firestore_db, recruiter_id, job_id, user_id, application_data)

        return jsonify({"success": True, "message": "Job applied successfully", "application_data": application_data}), 200
    except Exception as e:
        return jsonify({"error": str(e), "application_data": application_data}), 500

    
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