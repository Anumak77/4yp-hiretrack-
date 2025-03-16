from datetime import datetime
from flask import Flask, request, jsonify, Blueprint
from firebase_admin import firestore, credentials
from flask_cors import CORS, cross_origin
from config import firestore_db, realtime_db 

cred = credentials.Certificate('firebase_service_account_key.json')

notifications_bp = Blueprint('notifications', __name__)

def create_notification(jobseeker_id, message, job_id):
    try:
        notifications_ref = db.collection("jobseekers").document(jobseeker_id).collection("notifications")

        notifications_ref.add({
            "message": message,
            "jobId": job_id,
            "status": "unread",
            "timestamp": datetime.now(),
        })
        print("Notification created successfully")
    except Exception as e:
        print(f"Error creating notification: {e}")