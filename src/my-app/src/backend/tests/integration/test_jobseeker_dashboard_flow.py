import pytest
from unittest.mock import patch, MagicMock
from flask import Flask
from routes.seeker_dashboard import seeker_dashboard_bp
from routes.seekeractions import seekeractions_bp

@pytest.fixture
def app():
    app = Flask(__name__)
    app.register_blueprint(seeker_dashboard_bp)
    app.register_blueprint(seekeractions_bp)
    return app

@pytest.fixture
def client(app):
    return app.test_client()

@patch("routes.seekeractions.firestore")
def test_save_job(mock_firestore, client):
    firestore_client = MagicMock()
    mock_firestore.client.return_value = firestore_client

    job_ref = MagicMock()
    job_ref.get.return_value.exists = False
    firestore_client.collection.return_value.document.return_value = job_ref

    payload = {
        "userId": "user123",
        "job": {
            "id": "job123",
            "Title": "Frontend Dev",
            "Company": "CoolCo"
        }
    }

    res = client.post("/save-job", json=payload)
    assert res.status_code == 200
    assert res.get_json()["success"] is True

@patch("routes.seeker_dashboard.auth")
@patch("routes.seeker_dashboard.firestore")
def test_fetch_jobseeker_jobs(mock_firestore, mock_auth, client):
    mock_auth.verify_id_token.return_value = {"uid": "user123"}

    doc = MagicMock()
    doc.id = "job123"
    doc.to_dict.return_value = {"Title": "Dev Job"}
    mock_firestore.client.return_value.collection.return_value.get.return_value = [doc]

    res = client.get("/fetch-jobseeker-jobs/savedjobs", headers={"Authorization": "Bearer token"})
    assert res.status_code == 200
    assert res.get_json()[0]["id"] == "job123"

@patch("routes.seekeractions.firestore")
@patch("routes.seekeractions.requests.post")
def test_apply_job(mock_requests, mock_firestore, client):
    firestore_client = MagicMock()
    mock_firestore.client.return_value = firestore_client

    firestore_client.collection.return_value.document.return_value.get.side_effect = [
        MagicMock(exists=False), 
        MagicMock(exists=True, to_dict=lambda: {"fileData": "data:application/pdf;base64,abc=="})  # CV found
    ]

    mock_requests.return_value.json.return_value = {"cosine similarity": 0.85}

    payload = {
        "userId": "user123",
        "matchScore": 85,
        "job": {
            "id": "job123",
            "Title": "Backend Intern",
            "Company": "DevCo",
            "recruiterId": "rec789"
        }
    }

    res = client.post("/apply-job", json=payload)
    assert res.status_code == 200
    assert res.get_json()["success"] is True

@patch("routes.seekeractions.firestore")
def test_withdraw_job(mock_firestore, client):
    firestore_client = MagicMock()
    mock_firestore.client.return_value = firestore_client

    res = client.post("/withdraw-job", json={
        "userId": "user123",
        "jobId": "job456",
        "recruiterId": "rec789"
    })
    assert res.status_code == 200
    assert res.get_json()["success"] is True
