# import sys
# import os
# sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# import pytest
# from unittest.mock import patch, MagicMock
# from flask import Flask
# from routes.recruitersearch import recruitersearch_bp

# @pytest.fixture
# def app():
#     app = Flask(__name__)
#     app.register_blueprint(recruitersearch_bp)
#     return app

# @pytest.fixture
# def client(app):
#     return app.test_client()

# @patch('routes.recruitersearch.firestore')
# def test_get_job_seekers(mock_firestore, client):
#     mock_doc = MagicMock()
#     mock_doc.id = "id1"
#     mock_doc.to_dict.return_value = {"firstName": "Alice", "lastName": "Smith", "industry": "Tech"}
#     mock_firestore.client.return_value.collection.return_value.stream.return_value = [mock_doc]

#     response = client.get('/fetch-jobseekers')
#     assert response.status_code == 200
#     data = response.get_json()
#     assert len(data) == 1
#     assert data[0]['firstName'] == "Alice"

# @patch('routes.recruitersearch.firestore')
# def test_search_by_first_name(mock_firestore, client):
#     mock_doc = MagicMock()
#     mock_doc.id = "id2"
#     mock_doc.to_dict.return_value = {"firstName": "Anushree", "lastName": "Patel", "industry": "AI"}
#     mock_firestore.client.return_value.collection.return_value.stream.return_value = [mock_doc]

#     response = client.get('/search-jobseekers?search_term=anushree&search_filter=first_name')
#     assert response.status_code == 200
#     data = response.get_json()
#     assert len(data) == 1
#     assert data[0]['firstName'].lower() == "anushree"

# @patch('routes.recruitersearch.firestore')
# def test_fuzzy_search(mock_firestore, client):
#     mock_doc = MagicMock()
#     mock_doc.id = "id3"
#     mock_doc.to_dict.return_value = {"firstName": "Bella", "lastName": "Knight", "industry": "Design"}
#     mock_firestore.client.return_value.collection.return_value.stream.return_value = [mock_doc]

#     response = client.get('/search-jobseekers?search_term=bell')
#     assert response.status_code == 200
#     data = response.get_json()
#     assert len(data) == 1
#     assert data[0]['firstName'] == "Bella"

# @patch('routes.recruitersearch.firestore_db')
# def test_fetch_applied_jobs_no_match(mock_db, client):
#     mock_job = MagicMock()
#     mock_job.id = "job123"
#     mock_job.to_dict.return_value = {"title": "UX Designer"}

#     mock_db.collection.return_value.document.return_value.collection.return_value.get.side_effect = [
#         [mock_job],  # recruiter's job postings
#         []           # jobseeker's applied jobs
#     ]

#     response = client.get('/fetch-jobseeker-applied-jobs/seeker1/recruiter1/applied_jobs')
#     assert response.status_code == 200
#     assert response.get_json() == []
