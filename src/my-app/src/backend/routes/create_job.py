from flask import Flask, request, jsonify, Blueprint
from firebase_admin import firestore
from flask_cors import CORS, cross_origin

db = firestore.client()

create_job_bp = Blueprint('create_job', __name__)

@create_job_bp.route('/create-job', methods=['POST'])
def create_job():
    try:
        
        id_token = request.headers.get('Authorization')
        if not id_token:
            return jsonify({"error": "Authorization token is required"}), 401

        
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token.get('uid')

        
        data = request.json
        if not data:
            return jsonify({"error": "Job data is required"}), 400

        
        job_id = data.get('id') or f"{data.get('Company')}-{data.get('Title')}".replace(" ", "-").lower()

        # Add metadata to the job
        job_with_metadata = {
            **data,
            "recruiterId": uid,
            "postedAt": datetime.now().isoformat(),
            "date": "NA",
            "jobpost": "NA"
        }

        # Save the job to Firestore
        firestore_db = firestore.client()
        job_ref = firestore_db.collection(f'recruiters/{uid}/jobposting').document(job_id)
        job_ref.set(job_with_metadata)

        realtime_db_ref = db.reference('/')  # Reference to the root level 'jobs' node
        realtime_db_ref.child(job_id).set(job_with_metadata)

        return jsonify({"success": True, "jobId": job_id}), 200

    except FirebaseError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500