import os
import sys
import pytest
from unittest.mock import patch, MagicMock
from flask import Flask

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from routes.viewapplicants import viewapplicants_bp

@pytest.fixture
def app():
    app = Flask(__name__)
    app.register_blueprint(viewapplicants_bp)
    return app

@pytest.fixture
def client(app):
    return app.test_client()

@patch('routes.viewapplicants.firestore_db')
def test_fetch_applicants_success(mock_firestore_db, client):
    mock_applicant = MagicMock()
    mock_applicant.id = "user123"
    mock_firestore_db.collection.return_value.stream.return_value = [mock_applicant]

    user_doc = MagicMock()
    user_doc.exists = True
    user_doc.to_dict.return_value = {"name": "Alice"}
    mock_firestore_db.collection.return_value.document.return_value.get.return_value = user_doc

    response = client.get('/fetch-applicants/rec1/job1')
    assert response.status_code == 200
    assert response.get_json()["success"] is True
    assert response.get_json()["applicants"][0]["name"] == "Alice"

def test_interview_applicants_missing_query(client):
    response = client.get('/interview-applicants/rec1/job1')
    assert response.status_code == 400
    assert "applicant_id is required" in response.get_json()["error"]

# @patch('routes.viewapplicants.firestore_db')
# def test_fetch_interview_applicants_success(mock_firestore_db, client):
#     applicant_doc = MagicMock()
#     applicant_doc.to_dict.return_value = {"name": "Bob"}
#     mock_firestore_db.collection.return_value.stream.return_value = [applicant_doc]

#     response = client.get('/fetch-interview-applicants/rec1/job1')
#     assert response.status_code == 200
#     assert response.get_json()["applicants"][0]["name"] == "Bob"

@patch('routes.viewapplicants.firestore')
@patch('routes.viewapplicants.auth')
def test_fetch_applicant_pdf_success(mock_auth, mock_firestore, client):
    mock_auth.verify_id_token.return_value = {"uid": "recruiter123"}

    doc = MagicMock()
    doc.exists = True
    doc.to_dict.return_value = {"fileData": "fake_base64_pdf"}
    mock_firestore.client.return_value.collection.return_value.document.return_value.get.return_value = doc

    response = client.get('/fetch-applicant-pdf/applicant123', headers={'Authorization': 'Bearer fake-token'})
    assert response.status_code == 200
    assert response.get_json()["fileData"] == "fake_base64_pdf"

# @patch('routes.viewapplicants.firestore_db')
# def test_matchscore_applicants_success(mock_firestore_db, client):
#     doc = MagicMock()
#     doc.to_dict.return_value = {"matchScore": 87}
#     mock_firestore_db.collection.return_value.document.return_value.get.return_value = doc

#     response = client.get('/matchscore-applicants/rec1/job1?applicant_id=user1')
#     assert response.status_code == 200
#     assert response.get_json()["matchscore"] == 87

@patch('routes.viewapplicants.auth')
@patch('routes.viewapplicants.firestore_db')
def test_send_job_offer_success(mock_firestore_db, mock_auth, client):
    mock_auth.verify_id_token.return_value = {"uid": "rec123"}

    job_doc = MagicMock()
    job_doc.exists = True
    job_doc.to_dict.return_value = {"Title": "Dev", "Company": "TechCorp"}
    mock_firestore_db.collection.return_value.document.return_value.collection.return_value.document.return_value.get.return_value = job_doc

    chat_doc = MagicMock()
    chat_doc.exists = False
    mock_firestore_db.collection.return_value.document.return_value.get.return_value = chat_doc

    response = client.post(
        '/send_job_offer/rec123/job456/user789',
        headers={'Authorization': 'Bearer token'}
    )

    assert response.status_code == 200
    assert response.get_json()["success"] is True
