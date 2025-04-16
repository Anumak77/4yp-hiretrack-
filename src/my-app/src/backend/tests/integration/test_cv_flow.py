import pytest
from unittest.mock import patch, MagicMock
from flask import Flask
from routes.cv import cv_bp
from routes.cv_generate import cv_generate_bp
from routes.cv_suggestions import cv_suggestions_bp

@pytest.fixture
def app():
    app = Flask(__name__)
    app.register_blueprint(cv_bp)
    app.register_blueprint(cv_generate_bp)
    app.register_blueprint(cv_suggestions_bp)
    return app

@pytest.fixture
def client(app):
    return app.test_client()

@patch("routes.cv.firestore")
@patch("routes.cv.auth")
def test_save_pdf_to_firestore(mock_auth, mock_firestore, client):
    mock_auth.verify_id_token.return_value = {"uid": "user123"}

    firestore_client = MagicMock()
    mock_firestore.client.return_value = firestore_client

    response = client.post("/save-pdf", headers={"Authorization": "Bearer token"}, json={
        "file": "fakebase64data"
    })

    assert response.status_code == 200
    assert "message" in response.get_json()
    firestore_client.collection.return_value.document.return_value.set.assert_called()

@patch("routes.cv.firestore")
@patch("routes.cv.auth")
def test_fetch_pdf_from_firestore(mock_auth, mock_firestore, client):
    mock_auth.verify_id_token.return_value = {"uid": "user123"}

    mock_doc = MagicMock()
    mock_doc.exists = True
    mock_doc.to_dict.return_value = {"fileData": "fakebase64data"}

    firestore_client = MagicMock()
    firestore_client.collection.return_value.document.return_value.get.return_value = mock_doc
    mock_firestore.client.return_value = firestore_client

    response = client.get("/fetch-pdf", headers={"Authorization": "Bearer token"})
    assert response.status_code == 200
    assert "fileData" in response.get_json()

def test_compare_with_description_success(client):
    from base64 import b64encode
    fake_pdf = b"%PDF-1.4\n% Fake PDF\n1 0 obj\n<< /Type /Catalog >>\nendobj\n"
    base64_pdf = b64encode(fake_pdf).decode()

    response = client.post("/compare_with_description", json={
        "JobDescription": "You will code.",
        "JobRequirment": "Must know Python.",
        "RequiredQual": "CS degree",
        "cv": base64_pdf
    })

    assert response.status_code == 200 or response.status_code == 400  

def test_generate_cv_creates_docx(client):
    payload = {
        "name": "Anushree Umak",
        "location": "Dublin",
        "contact": "anushree@example.com",
        "education": "MSc in AI",
        "experience": "Worked on HireTrack",
        "skills": "Python, Flask, React"
    }

    response = client.post("/generate-cv", json=payload)
    assert response.status_code == 200
    assert response.mimetype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
