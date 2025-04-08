from flask import Flask, request, jsonify, Blueprint
from firebase_admin import firestore
from flask_cors import CORS, cross_origin
from config import firestore_db, realtime_db 
from datetime import datetime

#cred = credentials.Certificate('firebase_service_account_key.json')

edit_profile_bp = Blueprint('edit_profile', __name__)

@edit_profile_bp.route('/update-profile/<user_id>', methods=['POST'])
def update_profile(user_id):
    try:
        data = request.json
        required_fields = ['first_name','last_name', 'location', 'industry', 'experience']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        profile_data = {
            'first_name': data['first_name'],
            'last_name': data['last_name'],
            'location': data['location'],
            'industry': data['industry'],
            'experience': data['experience'],
            'qualifications': data.get('qualifications', ''),
            'pastJobs': data.get('pastJobs', ''),
            'last_updated': datetime.now()
        }
        
        user_ref = firestore_db.collection('jobseekers').document(user_id)
        user_ref.update(profile_data)
        
        return jsonify({
            "success": True,
            "message": "Profile updated successfully",
            "data": profile_data
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@edit_profile_bp.route('/get-profile/<user_id>', methods=['GET'])
def get_profile(user_id):
    try:
        user_ref = firestore_db.collection('jobseekers').document(user_id)
        doc = user_ref.get()
        
        if not doc.exists:
            return jsonify({"error": "User not found"}), 404
            
        return jsonify(doc.to_dict()), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500