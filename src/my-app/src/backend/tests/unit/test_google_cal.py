# import sys
# import os
# import pytest
# from flask import Flask
# from unittest.mock import patch, MagicMock

# sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
# from routes.google_cal import google_cal_bp

# @pytest.fixture
# def app():
#     app = Flask(__name__)
#     app.register_blueprint(google_cal_bp)
#     return app

# @pytest.fixture
# def client(app):
#     return app.test_client()

# @patch('routes.google_cal.firestore_db')
# @patch('routes.google_cal.requests.get')
# # def test_store_google_token_success(mock_get, mock_firestore, client):
# #     mock_get.return_value.json.return_value = {}  
# #     mock_user_ref = MagicMock()
# #     mock_firestore.collection.return_value.document.return_value = mock_user_ref

# #     payload = {
# #         "uid": "test-user",
# #         "token": "valid-access-token",
# #         "refreshToken": "refresh-token"
# #     }

# #     response = client.post('/store-google-token', json=payload)
# #     assert response.status_code == 200
# #     assert response.get_json()['message'] == 'Google token stored successfully'

# # @patch('routes.google_cal.requests.get')
# # def test_store_google_token_invalid_token(mock_get, client):
# #     mock_get.return_value.json.return_value = {"error": "invalid_token"}

# #     payload = {
# #         "uid": "test-user",
# #         "token": "invalid-access-token",
# #         "refreshToken": "refresh-token"
# #     }

# #     response = client.post('/store-google-token', json=payload)
# #     assert response.status_code == 400
# #     assert "error" in response.get_json()

# # def test_get_calendar_events_no_token(client):
# #     response = client.get('/get-calendar-events')
# #     assert response.status_code == 401
# #     assert response.get_json()['error'] == "Authorization token is required"
