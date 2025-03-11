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
from routes.auth import auth_bp  
from routes.cv import cv_bp 
from routes.seekersearch import seekersearch_bp 
from routes.seekeractions import seekeractions_bp
from routes.recruiterdashboard import recruiterdash_bp
from routes.recruitersearch import recruitersearch_bp
from routes.viewapplicants import viewapplicants_bp
from routes.create_job import create_job_bp
from routes.view_jobpostings import view_jobpostings_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_bp)
app.register_blueprint(cv_bp)
app.register_blueprint(seekersearch_bp)
app.register_blueprint(seekeractions_bp)
app.register_blueprint(recruiterdash_bp)
app.register_blueprint(recruitersearch_bp)
app.register_blueprint(view_jobpostings_bp)
app.register_blueprint(viewapplicants_bp)
app.register_blueprint(create_job_bp)


FIREBASE_DATABASE_URL = "https://hiretrack-7b035-default-rtdb.europe-west1.firebasedatabase.app/"

if __name__ == '__main__':
    app.run(port=5000)