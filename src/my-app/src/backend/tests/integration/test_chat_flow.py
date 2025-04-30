from unittest.mock import patch, MagicMock
import pytest
from flask import Flask
from routes.chat import chat_bp

@pytest.fixture
def app():
    app = Flask(__name__)
    app.register_blueprint(chat_bp)
    return app

@pytest.fixture
def client(app):
    return app.test_client()

@patch('routes.chat.firestore_db')
def test_send_message_recruiter_creates_chat(mock_firestore_db, client):
    chat_ref = MagicMock()
    chat_ref.get.return_value.exists = False
    mock_firestore_db.collection.return_value.document.return_value = chat_ref

    payload = {
        "sender_id": "rec123",
        "recipient_id": "app456",
        "message": "Hello!"
    }

    response = client.post('/send_message_recruiter', json=payload)
    assert response.status_code == 200
    assert response.get_json()["success"] is True
    chat_ref.set.assert_called_once()

@patch('routes.chat.firestore_db')
def test_send_message_jobseeker_updates_existing_chat(mock_firestore_db, client):
    chat_ref = MagicMock()
    chat_ref.get.return_value.exists = True
    mock_firestore_db.collection.return_value.document.return_value = chat_ref

    payload = {
        "sender_id": "app456",
        "recipient_id": "rec123",
        "message": "Hi!"
    }

    response = client.post('/send_message_jobseeker', json=payload)
    assert response.status_code == 200
    assert response.get_json()["success"] is True
    chat_ref.update.assert_called_once()

@patch('routes.chat.firestore_db')
def test_get_chat_history_returns_messages(mock_firestore_db, client):
    chat_doc = MagicMock()
    chat_doc.exists = True
    chat_doc.to_dict.return_value = {
        "messages": [{"text": "Hi", "sender": "rec123"}]
    }

    mock_firestore_db.collection.return_value.document.return_value.get.return_value = chat_doc

    response = client.get('/get_chat_history?chat_id=rec123_app456')
    assert response.status_code == 200
    assert response.get_json()["messages"][0]["text"] == "Hi"

@patch('routes.chat.firestore')
def test_get_recruiter_chats_returns_list(mock_firestore, client):
    chat_doc = MagicMock()
    chat_doc.id = "chat1"
    chat_doc.to_dict.return_value = {"recruiterId": "rec123"}

    query = MagicMock()
    query.get.return_value = [chat_doc]
    mock_firestore.client.return_value.collection.return_value.where.return_value = query

    response = client.get('/get_recruiter_chats?recruiter_id=rec123')
    assert response.status_code == 200
    assert response.get_json()["chats"][0]["id"] == "chat1"
