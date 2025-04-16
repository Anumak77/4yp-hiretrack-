# import os
# import sys
# import pytest
# from unittest.mock import patch
# from flask import Flask

# # Add backend path
# sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# from routes.train_resume_data import train_resume_bp

# @pytest.fixture
# def app():
#     app = Flask(__name__)
#     app.register_blueprint(train_resume_bp)
#     return app

# @pytest.fixture
# def client(app):
#     return app.test_client()

# # 🔹 Test: Success case for /resume-dataset
# @patch('routes.train_resume_data.process_resumes')
# def test_get_dataset_success(mock_process_resumes, client):
#     mock_process_resumes.return_value = [
#         {"name": "Alice", "skills": ["Python", "ML"]},
#         {"name": "Bob", "skills": ["Java", "Cloud"]}
#     ]

#     response = client.get('/resume-dataset')
#     assert response.status_code == 200
#     data = response.get_json()
#     assert isinstance(data, list)
#     assert data[0]["name"] == "Alice"
#     assert "skills" in data[1]

# # 🔹 Test: Internal server error
# @patch('routes.train_resume_data.process_resumes')
# def test_get_dataset_exception(mock_process_resumes, client):
#     mock_process_resumes.side_effect = Exception("Dataset read error")

#     response = client.get('/resume-dataset')
#     assert response.status_code == 500
#     assert "error" in response.get_json()
#     assert "Dataset read error" in response.get_json()["error"]
