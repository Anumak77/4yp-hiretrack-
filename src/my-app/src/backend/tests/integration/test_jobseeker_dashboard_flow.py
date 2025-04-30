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
