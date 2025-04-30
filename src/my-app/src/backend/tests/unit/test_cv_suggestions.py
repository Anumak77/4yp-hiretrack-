import sys
import os
import pytest
import base64
from io import BytesIO
from flask import Flask
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from routes.cv_suggestions import cv_suggestions_bp

@pytest.fixture
def app():
    app = Flask(__name__)
    app.register_blueprint(cv_suggestions_bp)
    return app

@pytest.fixture
def client(app):
    return app.test_client()

def test_no_cv_uploaded(client):
    payload = {
        "jobTitle": "Software Engineer",
        "jobDescription": "Build scalable systems",
        "jobRequirment": "3+ years experience"
    }
    response = client.post("/cv-suggestions", json=payload)
    assert response.status_code == 400
    assert response.get_json()["error"] == "No CV provided"

@patch("routes.cv_suggestions.PdfReader")
@patch("routes.cv_suggestions.requests.post")
def test_valid_cv_suggestion(mock_post, mock_pdf_reader, client):
    mock_page = MagicMock()
    mock_page.extract_text.return_value = "Experienced Python Developer"
    mock_pdf_reader.return_value.pages = [mock_page]

    mock_post.return_value.status_code = 200
    mock_post.return_value.json.return_value = {
        "choices": [
            {
                "message": {
                    "content": "- Add more quantifiable results.\n- Customize summary."
                }
            }
        ]
    }

    dummy_pdf = BytesIO(b"%PDF-1.4 dummy content")
    encoded_pdf = base64.b64encode(dummy_pdf.getvalue()).decode('utf-8')

    payload = {
        "cv": encoded_pdf,
        "jobTitle": "Software Engineer",
        "jobDescription": "Build scalable systems",
        "jobRequirment": "3+ years experience"
    }

    response = client.post("/cv-suggestions", json=payload)
    assert response.status_code == 200
    assert "suggestions" in response.get_json()
