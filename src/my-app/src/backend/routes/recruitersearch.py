from flask import Flask, request, jsonify, Blueprint
from fuzzywuzzy import process
from firebase_admin import credentials, initialize_app, auth, firestore
from flask_cors import cross_origin
from config import firestore_db, realtime_db 
from firebase_admin.exceptions import FirebaseError

recruitersearch_bp = Blueprint('recruitersearch', __name__)
cred = credentials.Certificate('firebase_service_account_key.json')

# Helper function to fetch job seekers
def fetch_job_seekers():
    firestore_db = firestore.client()
    seekers_ref = firestore_db.collection('jobseekers')
    seekers = seekers_ref.stream()
    seekers_list = []
    for seeker in seekers:
        seeker_data = seeker.to_dict()
        seeker_data['id'] = seeker.id
        seekers_list.append(seeker_data)
    return seekers_list

# Route to fetch all job seekers
@recruitersearch_bp.route('/fetch-jobseekers', methods=['GET'])
def get_job_seekers():
    seekers_list = fetch_job_seekers()
    return jsonify(seekers_list)

# Route to search and filter job seekers
@recruitersearch_bp.route('/search-jobseekers', methods=['GET'])
def search_job_seekers():
    search_term = request.args.get('search_term', '').lower()
    search_filter = request.args.get('search_filter', '').lower()

    seekers_list = fetch_job_seekers()
    filtered_seekers = []

    if search_filter == "first_name":
        filtered_seekers = [seeker for seeker in seekers_list if search_term in seeker.get('firstName', '').lower()]
    elif search_filter == "last_name":
        filtered_seekers = [seeker for seeker in seekers_list if search_term in seeker.get('lastName', '').lower()]
    elif search_filter == "industry":
        filtered_seekers = [seeker for seeker in seekers_list if search_term in seeker.get('industry', '').lower()]
    else:
        # Use fuzzy search if no specific filter is provided
        choices = [f"{seeker.get('firstName', '')} {seeker.get('lastName', '')} {seeker.get('industry', '')}" for seeker in seekers_list]
        results = process.extract(search_term, choices, limit=10)
        filtered_seekers = [seekers_list[i] for (_, i) in results]

    return jsonify(filtered_seekers)

@recruitersearch_bp.route('/fetch-jobseeker-applied-jobs/<jobseeker_id>/<recruiter_id>/<job_list>', methods=['GET'])
@cross_origin()
def fetch_jobseeker_applied_jobs(jobseeker_id, recruiter_id, job_list):
    try:
        recruiter_jobs_ref = firestore_db.collection('recruiters').document(recruiter_id).collection('jobposting')
        recruiter_job_ids = [doc.id for doc in recruiter_jobs_ref.get()]

        jobs_ref = firestore_db.collection(f'jobseekers/{jobseeker_id}/{job_list}')
        jobs_snapshot = jobs_ref.get()

        matching_jobs = []
        for doc in jobs_snapshot:
            applied_job_id = doc.id
            
            if applied_job_id in recruiter_job_ids:
                job_data = doc.to_dict()
                job_posting = recruiter_jobs_ref.document(applied_job_id).get().to_dict()
                
                matching_jobs.append({ 
                    "id": applied_job_id,
                    **job_data 
                })

        return jsonify(matching_jobs), 200

    except FirebaseError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500