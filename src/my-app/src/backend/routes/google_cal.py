from flask import Flask, request, jsonify, Blueprint
import firebase_admin
from firebase_admin import credentials, firestore
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import os
from config import firestore_db, realtime_db 
import requests 
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests 
import time

cred = credentials.Certificate('firebase_service_account_key.json')

google_cal_bp = Blueprint('google_cal', __name__)

@google_cal_bp.after_request
def add_security_headers(response):
    response.headers['Cross-Origin-Opener-Policy'] = 'same-origin-allow-popups'
    response.headers['Cross-Origin-Embedder-Policy'] = 'require-corp'
    return response

# Google OAuth Config
GOOGLE_CLIENT_ID = "714625690444-bjnr3aumebso58niqna7613rtvmc5e6f.apps.googleusercontent.com"

@google_cal_bp.route('/store-google-token', methods=['POST'])
def store_google_token():
    try:
        data = request.get_json()
        uid = data['uid']
        access_token = data['token']

        # verify the access token
        token_info = requests.get(
            'https://www.googleapis.com/oauth2/v3/tokeninfo',
            params={'access_token': access_token}
        ).json()

        if 'error' in token_info:
            raise ValueError(token_info['error'])

        # Store in firestore
        user_ref = firestore_db.collection('users').document(uid)
        user_ref.update({
            'googleTokens': {
                'accessToken': access_token,
                'expiryDate': time.time() + 9600  # 1 hr expiration
            }
        })

        return jsonify({'message': 'Google token stored successfully'}), 200

    except Exception as e:
        print(f'Error storing token: {str(e)}')
        return jsonify({'error': str(e)}), 400

@google_cal_bp.route('/get-calendar-events', methods=['GET'])
def get_calendar_events():
    try:
        # Verify Firebase auth
        id_token = request.headers.get('Authorization').split(' ')[1]
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']

        # Get user's stored tokens
        user_ref = firestore_db.collection('users').document(uid)
        user_data = user_ref.get().to_dict()
        
        if not user_data or 'googleTokens' not in user_data:
            return jsonify({'error': 'Google Calendar not connected'}), 400

        # Create credentials from stored tokens
        creds = Credentials(
            token=user_data['googleTokens']['accessToken'],
            refresh_token=user_data['googleTokens'].get('refreshToken'),
            token_uri='https://oauth2.googleapis.com/token',
            client_id=GOOGLE_CLIENT_ID
        )

        # Build calendar service
        service = build('calendar', 'v3', credentials=creds)

        # Get events with time range (next 30 days)
        now = datetime.utcnow().isoformat() + 'Z'
        future = (datetime.utcnow() + timedelta(days=30)).isoformat() + 'Z'
        
        events_result = service.events().list(
            calendarId='primary',
            timeMin=now,
            timeMax=future,
            singleEvents=True,
            orderBy='startTime'
        ).execute()

        return jsonify(events_result.get('items', [])), 200

    except Exception as e:
        print(f'Error fetching events: {str(e)}')
        return jsonify({'error': str(e)}), 500