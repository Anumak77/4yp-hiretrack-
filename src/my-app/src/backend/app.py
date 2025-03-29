from flask import Flask, request, jsonify
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import base64
import requests
import PyPDF2
from rapidfuzz import process
import pandas as pd 
from io import BytesIO
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, db
from PyPDF2 import PdfReader
import io
from flask_cors import cross_origin

from routes.auth import auth_bp  
from routes.cv import cv_bp 
from routes.seekersearch import seekersearch_bp 
from routes.seekeractions import seekeractions_bp
from routes.recruiterdashboard import recruiterdash_bp
from routes.recruitersearch import recruitersearch_bp
from routes.viewapplicants import viewapplicants_bp
from routes.create_job import create_job_bp
from routes.view_jobpostings import view_jobpostings_bp
from routes.seeker_dashboard import seeker_dashboard_bp
from routes.notifications import notifications_bp
from routes.cv_extract import cv_extract_bp
from routes.train_resume_data import train_resume_bp
from routes.cv_suggestions import cv_suggestions_bp
from routes.cv_generate import cv_generate_bp
from routes.chat import chat_bp
from routes.google_cal import google_cal_bp
from routes.cors import init_cors
app = Flask(__name__)
init_cors(app)

'''
@app.before_request
def handle_cookies():
    if request.method == "OPTIONS":
        response = jsonify({'status': 'preflight'})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "*")
        response.headers.add("Access-Control-Allow-Methods", "*")
        return response

@app.after_request
def add_security_headers(response):
    response.headers['Cross-Origin-Opener-Policy'] = 'same-origin-allow-popups'
    return response

'''

app.register_blueprint(train_resume_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(cv_bp)
app.register_blueprint(seekersearch_bp)
app.register_blueprint(seekeractions_bp)
app.register_blueprint(recruiterdash_bp)
app.register_blueprint(recruitersearch_bp)
app.register_blueprint(view_jobpostings_bp)
app.register_blueprint(viewapplicants_bp)
app.register_blueprint(create_job_bp)
app.register_blueprint(seeker_dashboard_bp)
app.register_blueprint(notifications_bp)
app.register_blueprint(cv_extract_bp)
app.register_blueprint(cv_suggestions_bp)
app.register_blueprint(cv_generate_bp)
app.register_blueprint(chat_bp)
app.register_blueprint(google_cal_bp)


FIREBASE_DATABASE_URL = "https://hiretrack-7b035-default-rtdb.europe-west1.firebasedatabase.app/"

if __name__ == '__main__':
    app.run(port=5000)