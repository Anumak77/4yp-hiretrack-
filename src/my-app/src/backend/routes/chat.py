from flask import Flask, request, jsonify, Blueprint
from firebase_admin import auth
from firebase_admin import exceptions as firebase_exceptions
from firebase_admin import firestore
from firebase_admin import credentials
import firebase_admin
from config import firestore_db, realtime_db 
from datetime import datetime

cred = credentials.Certificate('firebase_service_account_key.json')

chat_bp = Blueprint('chat', __name__)


@chat_bp.route("/send_message_recruiter", methods=["POST"])
def send_message_recruiter():
    data = request.json
    sender_id = data.get("sender_id")
    recipient_id = data.get("recipient_id")
    message_text = data.get("message")


    if not message_text or len(message_text.strip()) == 0:
        return jsonify({"error": "Message cannot be empty"}), 400

    chat_id = f"{sender_id}_{recipient_id}"
    chat_ref = firestore_db.collection("chats").document(chat_id)
    chat_doc = chat_ref.get()

    new_message = {
        "sender": sender_id,
        "recipient": recipient_id,
        "text": message_text,
        "timestamp": datetime.now().isoformat(),
    }

    if chat_doc.exists:
        chat_ref.update({"messages": firestore.ArrayUnion([new_message])})
    else:
        chat_ref.set({"messages": [new_message]})

    return jsonify({"success": True, "message": "Message sent"})

@chat_bp.route("/send_message_jobseeker", methods=["POST"])
def send_message_jobseeker():
    data = request.json
    sender_id = data.get("sender_id")
    recipient_id = data.get("recipient_id")
    message_text = data.get("message")


    if not message_text or len(message_text.strip()) == 0:
        return jsonify({"error": "Message cannot be empty"}), 400

    chat_id = f"{recipient_id}_{sender_id}"
    chat_ref = firestore_db.collection("chats").document(chat_id)
    chat_doc = chat_ref.get()

    new_message = {
        "sender": sender_id,
        "recipient": recipient_id,
        "text": message_text,
        "timestamp": datetime.now().isoformat(),
    }

    if chat_doc.exists:
        chat_ref.update({"messages": firestore.ArrayUnion([new_message])})
    else:
        chat_ref.set({"messages": [new_message]})

    return jsonify({"success": True, "message": "Message sent"})


@chat_bp.route("/get_chat_history", methods=["GET"])
def get_chat_history():
    chat_id = request.args.get("chat_id")
    if not chat_id:
        return jsonify({"error": "Chat ID is required"}), 400

    chat_ref = firestore_db.collection("chats").document(chat_id)
    chat_doc = chat_ref.get()

    if not chat_doc.exists:
        return jsonify({"error": "Chat not found"}), 404

    messages = chat_doc.to_dict().get("messages", [])
    return jsonify({"messages": messages})


@chat_bp.route("/get_recruiter_chats", methods=["GET"])
def get_recruiter_chats():
    recruiter_id = request.args.get("recruiter_id")
    if not recruiter_id:
        return jsonify({"error": "Recruiter ID is required"}), 400

    chats_ref = firestore.client().collection("chats")
    q = chats_ref.where("recruiterId", "==", recruiter_id)
    snapshot = q.get()
    
    chats = [{"id": doc.id, **doc.to_dict()} for doc in snapshot]
    return jsonify({"chats": chats})

@chat_bp.route("/get_applicant_chats", methods=["GET"])
def get_applicant_chats():
    applicant_id = request.args.get("applicant_id")
    if not applicant_id:
        return jsonify({"error": "Recruiter ID is required"}), 400

    chats_ref = firestore.client().collection("chats")
    q = chats_ref.where("applicantId", "==", applicant_id)
    snapshot = q.get()
    
    chats = [{"id": doc.id, **doc.to_dict()} for doc in snapshot]
    return jsonify({"chats": chats})


@chat_bp.route("/create_chat", methods=["POST"])
def create_chat():
    data = request.json
    recruiter_id = data.get("recruiter_id")
    applicant_id = data.get("applicant_id")

    applicant_ref = firestore_db.collection("jobseekers").document(applicant_id)
    applicant_doc = applicant_ref.get()

    recruiter_ref = firestore_db.collection("recruiters").document(recruiter_id)
    recruiter_doc = recruiter_ref.get()

    if not applicant_doc.exists:
        return jsonify({"error": "Applicant not found"}), 404

    applicant_data = applicant_doc.to_dict()
    applicant_name = f"{applicant_data.get('first_name', 'Unknown')} {applicant_data.get('last_name', '')}".strip()

    recruiter_data = recruiter_doc.to_dict()
    recruiter_name = f"{recruiter_data.get('first_name', 'Unknown')} {recruiter_data.get('last_name', '')}".strip()


    if not recruiter_id or not applicant_id:
        return jsonify({"error": "Recruiter ID and applicant ID are required"}), 400

    chat_id = f"{recruiter_id}_{applicant_id}"
    chat_ref = firestore.client().collection("chats").document(chat_id)
    chat_doc = chat_ref.get()

    if chat_doc.exists:
        return jsonify({"error": "Chat already exists"}), 200

    chat_ref.set({
        "recruiterId": recruiter_id,
        "applicantId": applicant_id,
        "applicantName": applicant_name,
        "recruiterName": recruiter_name,
        "messages": [],
    })

    return jsonify({"success": True, "chat_id": chat_id})

@chat_bp.route("/get_jobseeker_details", methods=["GET"])
def get_jobseeker_details():
    jobseeker_id = request.args.get("jobseeker_id")
    if not jobseeker_id:
        return jsonify({"error": "Jobseeker ID is required"}), 400

    jobseeker_ref = firestore_db.collection("jobseeker").document(jobseeker_id)
    jobseeker_doc = jobseeker_ref.get()

    if not jobseeker_doc.exists:
        return jsonify({"error": "Jobseeker not found"}), 404

    jobseeker_data = jobseeker_doc.to_dict()
    return jsonify(jobseeker_data)