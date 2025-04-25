# import sys
# import os
# sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# from firebase_admin import firestore_
# from flask import Flask, request, jsonify, Blueprint
# from firebase_admin import credentials 
# from firebase_admin import firestore, credentials
# from flask_cors import CORS, cross_origin
# from config import firestore_db, realtime_db

# # Add backend directory to Python path
# sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
# from routes.edit_job import edit_job_bp

# 
# @pytest.fixture
# def app():
#     app = Flask(__name__)
#     app.register_blueprint(edit_job_bp)
#     return app

# @pytest.fixture
# def client(app):
#     return app.test_client()

# @patch('routes.edit_job.firestore_db')
# def test_fetch_job_success(mock_db, client):
#     mock_job_doc = MagicMock()
#     mock_job_doc.exists = True
#     mock_job_doc.to_dict.return_value = {"title": "AI Engineer"}

#     mock_db.collection.return_value.document.return_value.collection.return_value.document.return_value.get.return_value = mock_job_doc

#     response = client.get('/fetch_job/user123/job456')
#     assert response.status_code == 200
#     assert response.get_json()['title'] == "AI Engineer"

# @patch('routes.edit_job.firestore_db')
# def test_fetch_job_not_found(mock_db, client):
#     mock_job_doc = MagicMock()
#     mock_job_doc.exists = False
#     mock_db.collection.return_value.document.return_value.collection.return_value.document.return_value.get.return_value = mock_job_doc

#     response = client.get('/fetch_job/user123/job999')
#     assert response.status_code == 404
#     assert "error" in response.get_json()

# @patch('routes.edit_job.firestore_db')
# def test_update_job_success(mock_db, client):
#     mock_job_ref = MagicMock()
#     mock_db.collection.return_value.document.return_value.collection.return_value.document.return_value = mock_job_ref

#     response = client.put('/update_job/user123/job456', json={"title": "Updated Title"})
#     assert response.status_code == 200
#     assert response.get_json()['success'] is True

# @patch('routes.edit_job.firestore_db')
# def test_update_job_failure(mock_db, client):
#     mock_db.collection.return_value.document.return_value.collection.return_value.document.return_value.update.side_effect = Exception("Update failed")

#     response = client.put('/update_job/user123/job456', json={"title": "Oops"})
#     assert response.status_code == 500
#     assert "error" in response.get_json()
