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


@chat_bp.route("/send_message", methods=["POST"])
def send_message():
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