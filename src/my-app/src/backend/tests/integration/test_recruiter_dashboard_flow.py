import pytest
from unittest.mock import patch, MagicMock
from flask import Flask
from routes.recruiterdashboard import recruiterdash_bp
from routes.recruitersearch import recruitersearch_bp

@pytest.fixture
def app():
    app = Flask(__name__)
    app.register_blueprint(recruiterdash_bp)
    app.register_blueprint(recruitersearch_bp)
    return app

@pytest.fixture
def client(app):
    return app.test_client()

@patch("routes.recruiterdashboard.firestore_db")
def test_num_jobpostings_and_applicants(mock_firestore, client):
    # Mock job posting stream
    mock_job_docs = [MagicMock() for _ in range(3)]
    mock_firestore.collection.return_value.stream.return_value = mock_job_docs

    # Test job count
    res1 = client.get("/numjobpostings?recruiter_id=rec123")
    assert res1.status_code == 200
    assert res1.get_json()["num_jobpostings"] == 3

    # Mock applicant metadata
    mock_doc = MagicMock()
    mock_doc.exists = True
    mock_doc.to_dict.return_value = {"applicantsnum": 42}
    mock_firestore.collection.return_value.document.return_value.get.return_value = mock_doc

    # Test applicant count
    res2 = client.get("/numapplicants?recruiter_id=rec123")
    assert res2.status_code == 200
    assert res2.get_json()["total_applicants"] == 42

@patch("routes.recruitersearch.firestore")
def test_fetch_jobseekers(mock_firestore, client):
    mock_seeker_doc = MagicMock()
    mock_seeker_doc.id = "abc"
    mock_seeker_doc.to_dict.return_value = {
        "firstName": "Anu", "lastName": "Shree", "industry": "AI"
    }
    mock_firestore.client.return_value.collection.return_value.stream.return_value = [mock_seeker_doc]

    res = client.get("/fetch-jobseekers")
    assert res.status_code == 200
    assert res.get_json()[0]["firstName"] == "Anu"

@patch("routes.recruitersearch.firestore")
def test_search_jobseekers_by_name(mock_firestore, client):
    doc = MagicMock()
    doc.id = "abc"
    doc.to_dict.return_value = {
        "firstName": "Anushree", "lastName": "Doe", "industry": "AI"
    }
    mock_firestore.client.return_value.collection.return_value.stream.return_value = [doc]

    res = client.get("/search-jobseekers?search_term=anu&search_filter=first_name")
    assert res.status_code == 200
    assert "Anushree" in res.get_json()[0]["firstName"]

@patch("routes.recruitersearch.firestore_db")
def test_fetch_jobseeker_applied_jobs_matches_recruiter_jobs(mock_firestore_db, client):
    recruiter_jobs = [MagicMock(id="job1"), MagicMock(id="job2")]
    recruiter_job_data = {"Title": "Backend Dev"}

    seeker_applied = [MagicMock()]
    seeker_applied[0].id = "job1"
    seeker_applied[0].to_dict.return_value = {"matchScore": 0.8}

    mock_job_posting_doc = MagicMock()
    mock_job_posting_doc.to_dict.return_value = recruiter_job_data

    mock_firestore_db.collection.return_value.document.return_value.collection.return_value.get.return_value = recruiter_jobs
    mock_firestore_db.collection.return_value.document.return_value.get.return_value = mock_job_posting_doc
    mock_firestore_db.collection.return_value.get.return_value = seeker_applied

    res = client.get("/fetch-jobseeker-applied-jobs/user123/rec123/appliedjobs")
    assert res.status_code == 200
    assert res.get_json()[0]["id"] == "job1"
    assert res.get_json()[0]["matchScore"] == 0.8
