from flask import Blueprint, request, jsonify
from firebase_admin import auth, firestore
from config import firestore_db

collab = Blueprint('collab', __name__)

@collab.route('/api/request-collab', methods=['POST'])
def request_collab():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"success": False, "message": "Missing Authorization header"}), 401

    try:
        id_token = auth_header.split(' ')[1]
        decoded_token = auth.verify_id_token(id_token)
        requester_id = decoded_token['uid']
        requester_email = decoded_token.get('email', '')
        requester_name = decoded_token.get('name', '')
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": "Invalid token"}), 401

    data = request.get_json()
    target_user_id = data.get('targetUserId')
    cv_id = data.get('cvId')
    selected_job_id = data.get('selectedJobId') 
    notes_experience = data.get('notes_experience', '')
    notes_education = data.get('notes_education', '')
    notes_projects = data.get('notes_projects', '')
    notes_skills = data.get('notes_skills', '')

    if not target_user_id or not cv_id:
        return jsonify({"success": False, "message": "Missing data"}), 400

    collab_ref = firestore_db.collection('collab_requests').document()
    collab_ref.set({
        'requester_id': requester_id,
        'requester_name': requester_name,
        'requester_email': requester_email,
        'target_user_id': target_user_id,
        'cv_id': cv_id,
        'job_id': selected_job_id,  
        'notes_experience': notes_experience,
        'notes_education': notes_education,
        'notes_projects': notes_projects,
        'notes_skills': notes_skills,
        'status': 'pending',
        'timestamp': firestore.SERVER_TIMESTAMP
    })

    return jsonify({"success": True}), 200



@collab.route('/api/incoming-collab-requests', methods=['GET'])
def incoming_collab_requests():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"success": False, "message": "Missing Authorization header"}), 401

    try:
        id_token = auth_header.split(' ')[1]
        decoded_token = auth.verify_id_token(id_token)
        current_user_id = decoded_token['uid']
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": "Invalid token"}), 401

    try:
        collab_ref = firestore_db.collection('collab_requests')
        query = collab_ref.where('target_user_id', '==', current_user_id).where('status', '==', 'pending')
        docs = query.stream()

        requests = []
        for doc in docs:
            data = doc.to_dict()
            requests.append({
                "id": doc.id,
                "requester_id": data.get("requester_id"),
                "requester_name": data.get("requester_name"),   
                "requester_email": data.get("requester_email"), 
                "cv_id": data.get("cv_id"),
                "job_id": data.get("job_id"),
                "status": data.get("status"),
                "timestamp": data.get("timestamp"),
                "notes_experience": data.get("notes_experience"), 
                "notes_education": data.get("notes_education"),   
                "notes_projects": data.get("notes_projects"),    
                "notes_skills": data.get("notes_skills"), 
            })

        return jsonify({"success": True, "requests": requests}), 200

    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": "Failed to fetch requests"}), 500


@collab.route('/api/respond-collab-request', methods=['POST'])
def respond_collab_request():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"success": False, "message": "Missing Authorization header"}), 401

    try:
        id_token = auth_header.split(' ')[1]
        decoded_token = auth.verify_id_token(id_token)  
        current_user_id = decoded_token['uid']
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": "Invalid token"}), 401

    data = request.get_json()
    request_id = data.get("requestId")
    action = data.get("action")

    if not request_id or action not in ["accept", "reject"]:
        return jsonify({"success": False, "message": "Invalid request data"}), 400

    try:
        collab_doc_ref = firestore_db.collection('collab_requests').document(request_id)
        collab_doc = collab_doc_ref.get()

        if not collab_doc.exists:
            return jsonify({"success": False, "message": "Collaboration request not found"}), 404

        collab_data = collab_doc.to_dict()
        if collab_data.get("target_user_id") != current_user_id:
            return jsonify({"success": False, "message": "Unauthorized"}), 403

        new_status = "accepted" if action == "accept" else "rejected"
        collab_doc_ref.update({"status": new_status})

        return jsonify({"success": True}), 200

    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": "Failed to update request"}), 500

@collab.route('/api/save-structured-cv', methods=['POST'])
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
        
        print("Received CV data:", cv_data)

        doc_ref = firestore_db.collection(f'jobseekers/{uid}/saved_cv').document('cvFields')
        doc_ref.set(cv_data)

        return jsonify({"success": True}), 200

    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": str(e)}), 500

@collab.route('/api/fetch-structured-cv', methods=['GET'])
def fetch_structured_cv():
    try:
        user_id = request.args.get('uid')
        if not user_id:
            return jsonify({"success": False, "message": "Missing UID"}), 400

        doc_ref = firestore_db.collection(f'jobseekers/{user_id}/saved_cv').document('cvFields')
        doc_snap = doc_ref.get()

        if not doc_snap.exists:
            return jsonify({"success": False, "message": "No structured CV found"}), 404

        data = doc_snap.to_dict()
        return jsonify({"success": True, "cvData": data}), 200

    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": str(e)}), 500

@collab.route('/api/fetch-collab-request-details', methods=['POST'])
def fetch_collab_request_details():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"success": False, "message": "Missing Authorization header"}), 401
        
        id_token = auth_header.split(' ')[1]
        decoded_token = auth.verify_id_token(id_token)

        data = request.get_json()
        request_id = data.get('requestId')

        if not request_id:
            return jsonify({"success": False, "message": "Missing request ID"}), 400

        collab_ref = firestore_db.collection('collab_requests').document(request_id)
        doc_snap = collab_ref.get()

        if not doc_snap.exists:
            return jsonify({"success": False, "message": "Request not found"}), 404

        return jsonify({"success": True, "request": doc_snap.to_dict()}), 200

    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": str(e)}), 500

@collab.route('/api/delete-collab-request/<request_id>', methods=['DELETE'])
def delete_collab_request(request_id):
    try:
        collab_ref = firestore_db.collection('collab_requests').document(request_id)
        collab_ref.delete()
        return jsonify({"success": True, "message": "Collaboration request deleted successfully!"}), 200
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": "Error deleting collaboration request!"}), 500
