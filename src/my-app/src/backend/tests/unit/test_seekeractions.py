import os
import sys
import pytest
from unittest.mock import patch, MagicMock
from flask import Flask

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from routes.seekeractions import seekeractions_bp

@pytest.fixture
def app():
    app = Flask(__name__)
    app.register_blueprint(seekeractions_bp)
    return app

@pytest.fixture
def client(app):
    return app.test_client()

@patch('routes.seekeractions.firestore')
def test_save_job_success(mock_firestore, client):
    mock_client = MagicMock()
    mock_doc = MagicMock()
    mock_doc.get.return_value.exists = False
    mock_client.collection.return_value.document.return_value = mock_doc
    mock_firestore.client.return_value = mock_client

    payload = {
        "userId": "user123",
        "job": {
            "id": "job123",
            "Company": "TestCorp",
            "Title": "Developer"
        }
    }

    response = client.post('/save-job', json=payload)
    assert response.status_code == 200
    assert response.get_json()["success"] is True

@patch('routes.seekeractions.firestore')
def test_save_job_already_exists(mock_firestore, client):
    mock_client = MagicMock()
    mock_doc = MagicMock()
    mock_doc.get.return_value.exists = True
    mock_client.collection.return_value.document.return_value = mock_doc
    mock_firestore.client.return_value = mock_client

    payload = {
        "userId": "user123",
        "job": {
            "id": "job123",
            "Company": "TestCorp",
            "Title": "Developer"
        }
    }

    response = client.post('/save-job', json=payload)
    assert response.status_code == 200
    assert response.get_json()["success"] is False

def test_save_job_missing_data(client):
    response = client.post('/save-job', json={})
    assert response.status_code == 400
    assert "error" in response.get_json()

@patch('routes.seekeractions.firestore')
def test_apply_job_user_already_applied(mock_firestore, client):
    firestore_mock = MagicMock()
    applicant_doc = MagicMock()
    applicant_doc.exists = True

    firestore_mock.collection.return_value.document.return_value.get.return_value = applicant_doc
    mock_firestore.client.return_value = firestore_mock

    payload = {
        "userId": "user123",
        "job": {
            "id": "job123",
            "Company": "TestCorp",
            "Title": "Developer",
            "recruiterId": "rec456"
        },
        "matchScore": 90
    }

    response = client.post('/apply-job', json=payload)
    assert response.status_code == 200
    assert "already applied" in response.get_json()["error"]

@patch('routes.seekeractions.firestore')
def test_withdraw_job_success(mock_firestore, client):
    firestore_mock = MagicMock()
    mock_firestore.client.return_value = firestore_mock

    payload = {
        "userId": "user123",
        "jobId": "job123",
        "recruiterId": "rec456"
    }

    response = client.post('/withdraw-job', json=payload)
    assert response.status_code == 200
    assert response.get_json()["success"] is True
