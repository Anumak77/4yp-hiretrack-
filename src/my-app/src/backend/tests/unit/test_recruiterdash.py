import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import sys
import os
import pytest
from flask import Flask
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from routes.recruiterdashboard import recruiterdash_bp

@pytest.fixture
def app():
    app = Flask(__name__)
    app.register_blueprint(recruiterdash_bp)
    return app

@pytest.fixture
def client(app):
    return app.test_client()

def test_num_jobpostings_missing_param(client):
    response = client.get('/numjobpostings')
    assert response.status_code == 400
    assert response.get_json()['error'] == "recruiter_id is required"

@patch('routes.recruiterdashboard.firestore_db')
def test_num_jobpostings_success(mock_db, client):
    mock_stream = [MagicMock(), MagicMock(), MagicMock()]  
    mock_db.collection.return_value.stream.return_value = mock_stream

    response = client.get('/numjobpostings?recruiter_id=test123')
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True
    assert data['recruiter_id'] == 'test123'
    assert data['num_jobpostings'] == 3

def test_num_applicants_missing_param(client):
    response = client.get('/numapplicants')
    assert response.status_code == 400
    assert response.get_json()['error'] == "recruiter_id is required"

@patch('routes.recruiterdashboard.firestore_db')
def test_num_applicants_success(mock_db, client):
    mock_doc = MagicMock()
    mock_doc.exists = True
    mock_doc.to_dict.return_value = {'applicantsnum': 42}
    mock_db.collection.return_value.document.return_value.get.return_value = mock_doc

    response = client.get('/numapplicants?recruiter_id=test456')
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True
    assert data['recruiter_id'] == 'test456'
    assert data['total_applicants'] == 42

@patch('routes.recruiterdashboard.firestore_db')
def test_num_applicants_no_data(mock_db, client):
    mock_doc = MagicMock()
    mock_doc.exists = False
    mock_db.collection.return_value.document.return_value.get.return_value = mock_doc

    response = client.get('/numapplicants?recruiter_id=empty123')
    assert response.status_code == 200
    data = response.get_json()
    assert data['total_applicants'] == 0
