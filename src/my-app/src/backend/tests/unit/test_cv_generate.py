import sys
import os
import pytest
from flask import Flask
from unittest.mock import patch
from io import BytesIO

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from routes.cv_generate import cv_generate_bp

@pytest.fixture
def app():
    app = Flask(__name__)
    app.register_blueprint(cv_generate_bp)
    return app

@pytest.fixture
def client(app):
    return app.test_client()

def test_options_request(client):
    response = client.options('/generate-cv')
    assert response.status_code == 200

def test_generate_cv_with_data(client):
    data = {
        "name": "Anushree Powerhouse",
        "location": "Dublin, Ireland",
        "contact": "anushree@example.com",
        "education": "DCU BSc Computing",
        "experience": "Software Intern @ Accenture",
        "projects": "HireTrack Final Year Project",
        "leadership": "Team Lead, SAP Finance Initiative",
        "skills": "React, Flask, SAP S/4HANA, Python"
    }

    response = client.post('/generate-cv', json=data)
    
    assert response.status_code == 200
    assert response.headers['Content-Type'] == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    assert response.headers['Content-Disposition'].startswith('attachment;')
    
    content = response.data
    assert isinstance(content, bytes)
    assert len(content) > 100  

def test_generate_cv_with_partial_data(client):
    data = {
        "name": "Anu",
        "contact": "a@b.com"
    }

    response = client.post('/generate-cv', json=data)
    assert response.status_code == 200
