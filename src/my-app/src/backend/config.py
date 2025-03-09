import firebase_admin
from firebase_admin import credentials, firestore, db

SERVICE_ACCOUNT_PATH = "firebase_service_account_key.json"


cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://hiretrack-7b035-default-rtdb.europe-west1.firebasedatabase.app/'
})


firestore_db = firestore.client()
realtime_db = db.reference()

