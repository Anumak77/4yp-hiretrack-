import os
import sys
import pytest
from unittest.mock import patch, MagicMock
from flask import Flask

# Add backend path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from routes.seekersearch import seekersearch_bp

@pytest.fixture
def app():
    app = Flask(__name__)
    app.register_blueprint(seekersearch_bp)
    return app

@pytest.fixture
def client(app):
    return app.test_client()

@patch('routes.seekersearch.realtime_db')
def test_jobs_success_dict(mock_realtime_db, client):
    mock_realtime_db.get.return_value = {
        "job1": {"title": "Developer"},
        "job2": {"title": "Designer"}
    }

    response = client.get('/jobs')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert {"title": "Developer"} in data
    assert {"title": "Designer"} in data

@patch('routes.seekersearch.realtime_db')
def test_jobs_success_list(mock_realtime_db, client):
    mock_realtime_db.get.return_value = [
        {"title": "Analyst"},
        {"title": "Engineer"}
    ]

    response = client.get('/jobs')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert {"title": "Analyst"} in data
    assert {"title": "Engineer"} in data

@patch('routes.seekersearch.realtime_db')
def test_jobs_no_data(mock_realtime_db, client):
    mock_realtime_db.get.return_value = None

    response = client.get('/jobs')
    assert response.status_code == 404
    assert "error" in response.get_json()

@patch('routes.seekersearch.realtime_db')
def test_jobs_exception(mock_realtime_db, client):
    mock_realtime_db.get.side_effect = Exception("Firebase error")

    response = client.get('/jobs')
    assert response.status_code == 500
    assert "error" in response.get_json()
