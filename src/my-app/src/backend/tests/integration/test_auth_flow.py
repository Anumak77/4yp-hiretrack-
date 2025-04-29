import pytest
from unittest.mock import patch, MagicMock
from flask import Flask
from routes.auth import auth_bp

@pytest.fixture
def app():
    app = Flask(__name__)
    app.register_blueprint(auth_bp)
    return app

@pytest.fixture
def client(app):
    return app.test_client()

@patch('routes.auth.auth')
@patch('routes.auth.firestore')
def test_signup_user_creates_auth_and_firestore_entries(mock_firestore, mock_auth, client):
    mock_auth.create_user.return_value.uid = 'user123'

    firestore_client = MagicMock()
    mock_firestore.client.return_value = firestore_client
    user_collection = MagicMock()
    firestore_client.collection.return_value = user_collection

    payload = {
        "email": "test@example.com",
        "password": "securepass",
        "first_name": "Anu",
        "last_name": "Shree",
        "userType": "Recruiter",
        "company_name": "TestCorp"
    }

    response = client.post('/signup', json=payload)
    assert response.status_code == 201
    assert response.get_json()["uid"] == "user123"
    assert "message" in response.get_json()

@patch('routes.auth.auth')
@patch('routes.auth.firestore_db')
def test_login_returns_user_data_if_valid_token(mock_firestore_db, mock_auth, client):
    mock_auth.verify_id_token.return_value = {
        "uid": "user123",
        "email": "test@example.com"
    }

    mock_user_doc = MagicMock()
    mock_user_doc.exists = True
    mock_user_doc.to_dict.return_value = {
        "userType": "Recruiter",
        "first_name": "Anu",
        "last_name": "Shree"
    }
    mock_firestore_db.collection.return_value.document.return_value.get.return_value = mock_user_doc

    response = client.post('/login', json={"idToken": "fake-token"})
    assert response.status_code == 200
    data = response.get_json()
    assert data["userType"] == "Recruiter"
    assert data["email"] == "test@example.com"
