from flask import Blueprint, request, jsonify
from firebase_admin import auth, firestore

cv_routes = Blueprint('cv_routes', __name__)

@cv_routes.route('/api/save-structured-cv', methods=['POST'])
def save_structured_cv():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"success": False, "message": "Missing Authorization header"}), 401
        
        id_token = auth_header.split(' ')[1]
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']

        cv_data = request.get_json()
        if not cv_data:
            return jsonify({"success": False, "message": "No CV data provided"}), 400

        firestore_db = firestore.client()
        doc_ref = firestore_db.collection(f'jobseekers/{uid}/saved_cv').document('cvFields')
        doc_ref.set(cv_data)

        return jsonify({"success": True}), 200

    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": str(e)}), 500
