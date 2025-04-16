import os
import sys
import pytest
import json
from flask import Flask
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from routes.cv import cv_bp

@pytest.fixture
def app():
    app = Flask(__name__)
    app.register_blueprint(cv_bp)
    return app

@pytest.fixture
def client(app):
    return app.test_client()

def test_save_pdf_missing_auth(client):
    response = client.post('/save-pdf', json={"file": "dummydata"})
    assert response.status_code == 401
    assert response.get_json()['error'] == "Authorization token is required"

@patch('routes.cv.auth.verify_id_token')
@patch('routes.cv.firestore')
def test_save_pdf_missing_file_data(mock_firestore, mock_verify_token, client):
    mock_verify_token.return_value = {'uid': 'mock-uid'}
    mock_firestore.client.return_value = MagicMock()
    response = client.post('/save-pdf', json={}, headers={"Authorization": "mock-token"})
    assert response.status_code == 400
    assert response.get_json()['error'] == "File data is required"

def test_fetch_pdf_missing_auth(client):
    response = client.get('/fetch-pdf')
    assert response.status_code == 401
    assert response.get_json()['error'] == "Authorization token is required"
