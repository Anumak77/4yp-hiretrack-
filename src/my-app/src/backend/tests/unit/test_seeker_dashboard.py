import os
import sys
import pytest
from unittest.mock import patch, MagicMock
from flask import Flask

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from routes.seeker_dashboard import seeker_dashboard_bp

@pytest.fixture
def app():
    app = Flask(__name__)
    app.register_blueprint(seeker_dashboard_bp)
    return app

@pytest.fixture
def client(app):
    return app.test_client()


@patch('routes.seeker_dashboard.auth')
@patch('routes.seeker_dashboard.firestore_db')
def test_move_job_success(mock_firestore_db, mock_auth, client):
    mock_auth.verify_id_token.return_value = {"uid": "user123"}

    mock_doc = MagicMock()
    mock_doc.get.return_value.to_dict.return_value = {"title": "Old Job"}
    mock_doc.delete.return_value = None

    mock_collection = MagicMock()
    mock_collection.document.return_value = mock_doc
    mock_firestore_db.collection.return_value = mock_collection

    payload = {
        "job_id": "job1",
        "source_collection": "saved",
        "target_collection": "applied"
    }

    response = client.post(
        '/move-job',
        headers={'Authorization': 'Bearer fake-token'},
        json=payload
    )

    assert response.status_code == 200
    assert response.get_json()["success"] is True


def test_move_job_no_auth(client):
    response = client.post('/move-job', json={"dummy": "data"})
    assert response.status_code == 401
    assert "error" in response.get_json()

def test_fetch_jobseeker_jobs_no_auth(client):
    response = client.get('/fetch-jobseeker-jobs/applied')
    assert response.status_code == 401
    assert "error" in response.get_json()
