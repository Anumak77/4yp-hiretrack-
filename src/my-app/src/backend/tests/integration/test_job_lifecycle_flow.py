# import pytest
# from unittest.mock import patch, MagicMock
# from flask import Flask
# from routes.create_job import create_job_bp
# from routes.edit_job import edit_job_bp
# from routes.view_jobpostings import view_jobpostings_bp

# @pytest.fixture
# def app():
#     app = Flask(__name__)
#     app.register_blueprint(create_job_bp)
#     app.register_blueprint(edit_job_bp)
#     app.register_blueprint(view_jobpostings_bp)
#     return app

# @pytest.fixture
# def client(app):
#     return app.test_client()

# @patch('routes.view_jobpostings.firestore_db')
# @patch('routes.view_jobpostings.auth')  # Only if needed
# @patch('routes.create_job.auth')
# @patch('routes.create_job.db')
# @patch('routes.create_job.firestore')
# def test_recruiter_job_lifecycle(mock_create_firestore, mock_create_db, mock_create_auth,
#                                   mock_view_auth, mock_view_firestore, client):
#     mock_create_auth.verify_id_token.return_value = {"uid": "recruiter123"}

#     firestore_client = MagicMock()
#     job_doc_ref = MagicMock()
#     mock_create_firestore.client.return_value = firestore_client
#     firestore_client.collection.return_value.document.return_value = job_doc_ref

#     mock_create_db.reference.return_value.child.return_value.set.return_value = None

#     job_data = {
#         "id": "test-job-id",
#         "Title": "Software Engineer",
#         "Company": "CodeCo",
#         "Description": "Build backend",
#         "Location": "Remote",
#     }

#     response = client.post(
#         "/create-job",
#         headers={"Authorization": "Bearer fake-token"},
#         json=job_data
#     )
#     assert response.status_code == 200
#     assert response.get_json()["success"] is True
#     job_doc_ref.set.assert_called_once()
#     mock_create_db.reference.return_value.child.return_value.set.assert_called_once()

#     job_doc = MagicMock()
#     job_doc.exists = True
#     job_doc.to_dict.return_value = job_data
#     mock_view_firestore.collection.return_value.document.return_value.get.return_value = job_doc

#     fetch_response = client.get(
#         "/fetch_job/recruiter123/test-job-id"
#     )
#     assert fetch_response.status_code == 200
#     assert fetch_response.get_json()["Title"] == "Software Engineer"
