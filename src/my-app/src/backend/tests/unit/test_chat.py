import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import json
import pytest
from flask import Flask
from routes.chat import chat_bp
from unittest.mock import patch, MagicMock


@pytest.fixture
def app():
    app = Flask(__name__)
    app.register_blueprint(chat_bp)
    return app

@pytest.fixture
def client(app):
    return app.test_client()

def test_send_message_recruiter_empty(client):
    res = client.post('/send_message_recruiter', json={
        "sender_id": "r1",
        "recipient_id": "j1",
        "message": "   "
    })
    assert res.status_code == 400
    assert res.get_json()["error"] == "Message cannot be empty"

@patch('routes.chat.firestore_db')
@patch('routes.chat.firestore')
def test_create_chat_already_exists(mock_firestore, mock_firestore_db, client):
    mock_doc = MagicMock()
    mock_doc.exists = True
    mock_firestore.client().collection().document().get.return_value = mock_doc

    res = client.post('/create_chat', json={
        "recruiter_id": "r1",
        "applicant_id": "j1"
    })
    assert res.status_code == 200
    assert res.get_json()["error"] == "Chat already exists"

@patch('routes.chat.firestore_db')
def test_create_chat_missing_fields(mock_db, client):
    res = client.post('/create_chat', json={})
    assert res.status_code == 400
    assert "error" in res.get_json()

def test_get_chat_history_missing_id(client):
    res = client.get('/get_chat_history')
    assert res.status_code == 400
    assert "Chat ID is required" in res.get_json()["error"]

@patch('routes.chat.firestore_db')
def test_get_chat_history_not_found(mock_db, client):
    mock_doc = MagicMock()
    mock_doc.exists = False
    mock_db.collection().document().get.return_value = mock_doc

    res = client.get('/get_chat_history?chat_id=chat123')
    assert res.status_code == 404
    assert res.get_json()["error"] == "Chat not found"
