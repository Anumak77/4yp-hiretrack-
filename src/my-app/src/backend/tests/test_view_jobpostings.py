import os
import sys
import pytest
from unittest.mock import patch, MagicMock
from flask import Flask

# Add backend path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from routes.view_jobpostings import view_jobpostings_bp

@pytest.fixture
def app():
    app = Flask(__name__)
    app.register_blueprint(view_jobpostings_bp)
    return app

@pytest.fixture
def client(app):
    return app.test_client()

# 🔹 Fetch specific job (success)
@patch('routes.view_jobpostings.firestore_db')
def test_fetch_job_success(mock_firestore_db, client):
    mock_doc = MagicMock()
    mock_doc.exists = True
    mock_doc.to_dict.return_value = {"title": "Test Job"}
    mock_firestore_db.collection.return_value.document.return_value.collection.return_value.document.return_value.get.return_value = mock_doc

    response = client.get('/fetch_job/user123/job456')
    assert response.status_code == 200
    assert response.get_json()["title"] == "Test Job"

# 🔹 Fetch specific job (not found)
@patch('routes.view_jobpostings.firestore_db')
def test_fetch_job_not_found(mock_firestore_db, client):
    mock_doc = MagicMock()
    mock_doc.exists = False
    mock_firestore_db.collection.return_value.document.return_value.collection.return_value.document.return_value.get.return_value = mock_doc

    response = client.get('/fetch_job/user123/job456')
    assert response.status_code == 404

# 🔹 Update job
@patch('routes.view_jobpostings.firestore_db')
def test_update_job_success(mock_firestore_db, client):
    response = client.put('/update_job/user123/job456', json={"title": "Updated"})
    assert response.status_code == 200
    assert "success" in response.get_json()

# 🔹 Fetch all jobs with token
@patch('routes.view_jobpostings.auth')
@patch('routes.view_jobpostings.firestore_db')
def test_fetch_jobs_success(mock_firestore_db, mock_auth, client):
    mock_auth.verify_id_token.return_value = {"uid": "user123"}
    mock_doc = MagicMock()
    mock_doc.id = "job1"
    mock_doc.to_dict.return_value = {"title": "Dev"}
    mock_firestore_db.collection.return_value.get.return_value = [mock_doc]

    response = client.get('/fetch-jobs', headers={'Authorization': 'Bearer test'})
    assert response.status_code == 200
    assert response.get_json()[0]["id"] == "job1"

# 🔹 Delete job with token
@patch('routes.view_jobpostings.auth')
@patch('routes.view_jobpostings.firestore_db')
def test_delete_job_success(mock_firestore_db, mock_auth, client):
    mock_auth.verify_id_token.return_value = {"uid": "user123"}
    response = client.delete('/delete-job/job1', headers={'Authorization': 'Bearer token'})
    assert response.status_code == 200
    assert response.get_json()["success"] is True

# 🔹 Add tag to job
@patch('routes.view_jobpostings.firestore_db')
def test_add_tag_success(mock_firestore_db, client):
    mock_doc = MagicMock()
    mock_doc.exists = True
    mock_doc.to_dict.return_value = {"tags": ["tag1"]}
    mock_firestore_db.collection.return_value.document.return_value.get.return_value = mock_doc

    response = client.post('/add-tag', json={"job_id": "job1", "tag": "tag2"})
    assert response.status_code == 200
    assert "tag2" in response.get_json()["tags"]

# 🔹 Remove tag from job
@patch('routes.view_jobpostings.firestore_db')
def test_remove_tag_success(mock_firestore_db, client):
    mock_doc = MagicMock()
    mock_doc.exists = True
    mock_doc.to_dict.return_value = {"tags": ["tag1", "tag2"]}
    mock_firestore_db.collection.return_value.document.return_value.get.return_value = mock_doc

    response = client.post('/remove-tag', json={"job_id": "job1", "tag": "tag2"})
    assert response.status_code == 200
    assert "tag2" not in response.get_json()["tags"]
