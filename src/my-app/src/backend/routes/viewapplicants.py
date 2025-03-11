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
                applicants_list.append({
                    "id": applicant_uid,
                    "first_name": user_data_dict.get("first_name", ""),
                    "last_name": user_data_dict.get("last_name", ""),
                    "email": user_data_dict.get("email", ""),
                    "location": user_data_dict.get("location", ""),
                    "phone_number": user_data_dict.get("phone_number", ""),
                    "status": "Pending",  
                    "tags": [],
                })

        return jsonify({
            "success": True,
            "applicants": applicants_list,
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500