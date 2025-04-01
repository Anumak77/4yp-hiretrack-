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
from firebase_admin import credentials, firestore, auth
import time
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from flask import Flask, request, jsonify, Blueprint
import firebase_admin
from firebase_admin import credentials, firestore, auth
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from datetime import datetime, timedelta 
import requests
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
GOOGLE_CLIENT_SECRET = "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"

@google_cal_bp.route('/store-google-token', methods=['POST'])
def store_google_token():
    try:
        data = request.get_json()
        uid = data['uid']
        access_token = data['token']
        refresh_token = data.get('refreshToken')

        # verify the access token
        token_info = requests.get(
            'https://www.googleapis.com/oauth2/v3/tokeninfo',
            params={'access_token': access_token}
        ).json()

        if 'error' in token_info:
            raise ValueError(token_info['error'])

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
                'expiryDate': time.time() + 10600,  # 1 hr expiration
                'refreshToken': refresh_token,
                'clientId': GOOGLE_CLIENT_ID,
                'clientSecret': GOOGLE_CLIENT_SECRET,
                'tokenUri': 'https://oauth2.googleapis.com/token',
                'scopes': ['https://www.googleapis.com/auth/calendar.events'],
            }
        })

        return jsonify({'message': 'Google token stored successfully'}), 200

    except Exception as e:
        print(f'Error storing token: {str(e)}')
        return jsonify({'error': str(e)}), 400

@google_cal_bp.route('/get-calendar-events', methods=['GET'])
def get_calendar_events():
    try:
        id_token = request.headers.get('Authorization')
        if not id_token:
            return jsonify({"error": "Authorization token is required"}), 401

        if id_token.startswith('Bearer '):
            id_token = id_token[7:]
            
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token.get('uid')

        # Get user's stored tokens
        user_ref = firestore_db.collection('users').document(uid)
        user_data = user_ref.get().to_dict()
        
        if not user_data or 'googleTokens' not in user_data:
            return jsonify({'error': 'Google Calendar not connected'}), 400

        tokens = user_data['googleTokens']

        # Create credentials from stored tokens
        creds = Credentials(
            token=tokens['accessToken'],
            refresh_token=tokens['refreshToken'],
            token_uri=tokens['tokenUri'],
            client_id=tokens['clientId'],
            client_secret=tokens['clientSecret'],
            scopes=tokens['scopes']
        )

         # Refresh token if expired
        if creds.expired:
            creds.refresh(Request())
            user_ref.update({
                'googleTokens.accessToken': creds.token,
                'googleTokens.expiryDate': time.time() + 3600
            })

        # Build calendar service
        service = build('calendar', 'v3', credentials=creds)

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

@google_cal_bp.route('/schedule-interview/<recruiter_id>/<job_id>/<applicant_id>', methods=['POST'])
def schedule_interview(recruiter_id, job_id, applicant_id):
    try:
        data = request.json
        interview_time = datetime.fromisoformat(data['date'])
        applicant_email = data['applicantEmail']
        job_title = data['jobTitle']
        interview_type = data['type']
        notes = data.get('notes', '')

        recruiter_ref = firestore_db.collection('users').document(recruiter_id)
        recruiter_data = recruiter_ref.get().to_dict()
        
        if not recruiter_data or 'googleTokens' not in recruiter_data:
            return jsonify({"error": "Google account not connected"}), 400
        
        tokens = recruiter_data['googleTokens']

        # Create credentials from stored tokens
        creds = Credentials(
            token=tokens['accessToken'],
            refresh_token=tokens['refreshToken'],
            token_uri=tokens['tokenUri'],
            client_id=tokens['clientId'],
            client_secret=tokens['clientSecret'],
            scopes=tokens['scopes']
        )

        service = build('calendar', 'v3', credentials=creds)

        event = {
            'summary': f'Interview for {job_title}',
            'description': f'Interview with {applicant_email}\nNotes: {notes}',
            'start': {
                'dateTime': interview_time.isoformat(),
                'timeZone': 'GMT',
            },
            'end': {
                'dateTime': (interview_time + timedelta(hours=1)).isoformat(),
                'timeZone': 'GMT',
            },
            'attendees': [{'email': applicant_email}],
            'conferenceData': {
                'createRequest': {
                    'requestId': f"{job_id}-{applicant_id}",
                    'conferenceSolutionKey': {'type': 'hangoutsMeet'}
                }
            } if interview_type == 'video' else None,
            'reminders': {
                'useDefault': True,
            },
        }

        created_event = service.events().insert(
            calendarId='primary',
            body=event,
            conferenceDataVersion=1 if interview_type == 'video' else 0
        ).execute()

        interview_ref = firestore_db.collection(f'recruiters/{recruiter_id}/jobposting/{job_id}/applicants/{applicant_id}/interviews').document()
        interview_ref.set({
            'interview': {
                'scheduled_at': interview_time,
                'type': interview_type,
                'notes': notes,
                'calendar_event_id': created_event.get('id'),
                'meet_link': created_event.get('hangoutLink', '') if interview_type == 'video' else None
            }
        })

        return jsonify({
            "success": True,
            "event_link": created_event.get('htmlLink'),
            "meet_link": created_event.get('hangoutLink', '')
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500