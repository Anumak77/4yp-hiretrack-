import sys
import os
import pytest
from flask import Flask
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from routes.editprofile import edit_profile_bp

@pytest.fixture
def app():
    app = Flask(__name__)
    app.register_blueprint(edit_profile_bp)
    return app

@pytest.fixture
def client(app):
    return app.test_client()

@patch('routes.editprofile.firestore_db')
def test_update_profile_success(mock_db, client):
    mock_user_ref = MagicMock()
    mock_db.collection.return_value.document.return_value = mock_user_ref

    payload = {
        "first_name": "Anushree",
        "last_name": "S.",
        "location": "London",
        "industry": "Tech",
        "experience": "2 years",
        "qualifications": "BSc CompSci",
        "pastJobs": "Intern at Accenture"
    }

    response = client.post('/update-profile/test-user', json=payload)
    assert response.status_code == 200
    assert response.get_json()['success'] is True
    assert response.get_json()['message'] == "Profile updated successfully"

def test_update_profile_missing_field(client):
    payload = {
        "first_name": "Anushree",
        "location": "London",
        "industry": "Tech",
        "experience": "2 years"
    }
    response = client.post('/update-profile/test-user', json=payload)
    assert response.status_code == 400
    assert "error" in response.get_json()

@patch('routes.editprofile.firestore_db')
def test_get_profile_success(mock_db, client):
    mock_doc = MagicMock()
    mock_doc.exists = True
    mock_doc.to_dict.return_value = {
        "first_name": "Anushree",
        "last_name": "S.",
        "location": "London"
    }
    mock_db.collection.return_value.document.return_value.get.return_value = mock_doc

    response = client.get('/get-profile/test-user')
    assert response.status_code == 200
    assert response.get_json()['first_name'] == "Anushree"

@patch('routes.editprofile.firestore_db')
def test_get_profile_not_found(mock_db, client):
    mock_doc = MagicMock()
    mock_doc.exists = False
    mock_db.collection.return_value.document.return_value.get.return_value = mock_doc

    response = client.get('/get-profile/unknown-user')
    assert response.status_code == 404
    assert "error" in response.get_json()
