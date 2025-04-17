import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
 
import json
from flask import Flask
import pytest
from routes.auth import auth_bp

@pytest.fixture
def app():
    app = Flask(__name__)
    app.register_blueprint(auth_bp)
    return app

@pytest.fixture
def client(app):
    return app.test_client()

def test_signup_missing_fields(client):
    response = client.post('/signup', json={
        "email": "test@example.com",
        "password": "",
        "first_name": "Test",
        "last_name": "User"
    })
    data = response.get_json()
    assert response.status_code == 400
    assert "error" in data

def test_login_missing_token(client):
    response = client.post('/login', json={})
    data = response.get_json()
    assert response.status_code == 400
    assert "error" in data
