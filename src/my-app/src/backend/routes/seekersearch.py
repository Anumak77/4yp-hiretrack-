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
def jobs():
    try:
        # Fetch all data from the Realtime Database
        ref = realtime_db
        data = ref.get()

        if data:
            if isinstance(data, dict):
                jobs_list = list(data.values())
            else:
                jobs_list = data  

            return jsonify(jobs_list), 200
        else:
            return jsonify({"error": "No data found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500