from flask import Flask, jsonify, request, Blueprint
import firebase_admin
from firebase_admin import credentials, db
from config import firestore_db, realtime_db 
from fuzzywuzzy import process
from datetime import datetime

app = Flask(__name__)

seekersearch_bp = Blueprint('seekersearch', __name__)



cred = credentials.Certificate("firebase_service_account_key.json")

@seekersearch_bp.route('/jobs', methods=['GET'])
def get_jobs():
    try:
        page = int(request.args.get('page', 1)) 
        limit = int(request.args.get('limit', 10))

        # Fetch all data from the Realtime Database
        ref = realtime_db
        data = ref.get()

        if data:
            # Convert the data to a list of jobs
            if isinstance(data, dict):
                jobs_list = list(data.values())
            else:
                jobs_list = data  # If it's already a list, use it directly

            # Paginate the results
            start = (page - 1) * limit
            end = start + limit
            paginated_jobs = jobs_list[start:end]

            return jsonify(paginated_jobs), 200
        else:
            return jsonify({"error": "No data found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@seekersearch_bp.route('/search-jobs', methods=['GET'])
def search_jobs():
    try:
        search_term = request.args.get('query', '').lower()
        search_filter = request.args.get('filter', 'all')

        # Fetch all jobs from the Realtime Database
        ref = db.reference('/')  # Fetch data from the root level
        data = ref.get()

        if not data:
            return jsonify({"error": "No data found"}), 404

        
        if isinstance(data, dict):
            jobs_list = list(data.values())
        else:
            jobs_list = data 

        filtered_jobs = []
        if search_filter == "location":
            filtered_jobs = [job for job in jobs_list if search_term in job.get('Location', '').lower()]
        elif search_filter == "company":
            filtered_jobs = [job for job in jobs_list if search_term in job.get('Company', '').lower()]
        elif search_filter == "title":
            filtered_jobs = [job for job in jobs_list if search_term in job.get('Title', '').lower()]
        else:
            choices = [f"{job.get('Title', '')} {job.get('Company', '')} {job.get('Location', '')}" for job in jobs_list]
            results = process.extract(search_term, choices, limit=10)
            filtered_jobs = [jobs_list[i] for (_, i) in results]

        return jsonify(filtered_jobs), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500