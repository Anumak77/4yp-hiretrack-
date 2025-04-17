import pytest
from unittest.mock import patch, MagicMock
from flask import Flask
from routes.create_job import create_job_bp
from routes.edit_job import edit_job_bp

@pytest.fixture
def app():
    app = Flask(__name__)
    app.register_blueprint(create_job_bp)
    app.register_blueprint(edit_job_bp)
    return app

@pytest.fixture
def client(app):
    return app.test_client()

@patch('routes.create_job.firestore')
@patch('routes.create_job.db')
@patch('routes.create_job.auth')
def test_recruiter_job_lifecycle(mock_auth, mock_db, mock_firestore, client):
    mock_auth.verify_id_token.return_value = {"uid": "recruiter123"}

    firestore_client = MagicMock()
    job_doc_ref = MagicMock()
    mock_firestore.client.return_value = firestore_client
    firestore_client.collection.return_value.document.return_value = job_doc_ref

    mock_db.reference.return_value.child.return_value.set.return_value = None

    job_data = {
        "id": "test-job-id",
        "Title": "Software Engineer",
        "Company": "CodeCo",
        "Description": "Build backend",
        "Location": "Remote",
    }

    response = client.post(
        "/create-job",
        headers={"Authorization": "Bearer fake-token"},
        json=job_data
    )
    assert response.status_code == 200
    assert response.get_json()["success"] is True
    job_doc_ref.set.assert_called_once()
    mock_db.reference.return_value.child.return_value.set.assert_called_once()
    
    with patch('routes.edit_job.firestore_db') as mock_fetch_firestore, \
         patch('routes.edit_job.credentials'), \
         patch('routes.edit_job.initialize_app'):

        job_doc = MagicMock()
        job_doc.exists = True
        job_doc.to_dict.return_value = job_data

        mock_fetch_firestore.collection.return_value.document.return_value.collection.return_value.document.return_value.get.return_value = job_doc

        fetch_response = client.get("/fetch_job/recruiter123/test-job-id")
        assert fetch_response.status_code == 200
        assert fetch_response.get_json()["Title"] == "Software Engineer"

    with patch('routes.edit_job.firestore_db') as mock_update_firestore, \
         patch('routes.edit_job.credentials'), \
         patch('routes.edit_job.initialize_app'):

        job_ref = MagicMock()
        mock_update_firestore.collection.return_value.document.return_value.collection.return_value.document.return_value = job_ref

        update_response = client.put(
            "/update_job/recruiter123/test-job-id",
            json={"Location": "Hybrid"}
        )
        assert update_response.status_code == 200
        job_ref.update.assert_called_once_with({"Location": "Hybrid"})

