import sys
import os
import pytest
import json
from flask import Flask
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from routes.create_job import create_job_bp

@pytest.fixture
def app():
    app = Flask(__name__)
    app.register_blueprint(create_job_bp)
    return app

@pytest.fixture
def client(app):
    return app.test_client()

def test_missing_auth_token(client):
    response = client.post('/create-job', json={})
    assert response.status_code == 401
    assert response.get_json()['error'] == "Authorization token is required"

@patch('routes.create_job.firestore')
@patch('routes.create_job.db')
@patch('routes.create_job.auth.verify_id_token')
def test_successful_job_creation(mock_verify, mock_db, mock_firestore, client):
    mock_verify.return_value = {'uid': 'mock-uid'}
    mock_firestore.client.return_value = MagicMock()
    mock_db.reference.return_value = MagicMock()

    job_data = {
        "Company": "CoolTech",
        "Title": "AI Engineer"
    }

    response = client.post(
        '/create-job',
        headers={'Authorization': 'mock-token'},
        json=job_data
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True
    assert 'jobId' in data
