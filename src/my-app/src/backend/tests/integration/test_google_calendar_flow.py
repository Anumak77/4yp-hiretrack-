import pytest
from unittest.mock import patch, MagicMock
from flask import Flask
from routes.google_cal import google_cal_bp
from datetime import datetime


@pytest.fixture
def app():
    app = Flask(__name__)
    app.register_blueprint(google_cal_bp)
    return app

@pytest.fixture
def client(app):
    return app.test_client()

@patch("routes.google_cal.firestore_db")
@patch("routes.google_cal.requests.get")
def test_store_google_token_success(mock_get, mock_firestore, client):
    mock_get.return_value.json.return_value = {} 

    mock_user_ref = MagicMock()
    mock_firestore.collection.return_value.document.return_value = mock_user_ref

    payload = {
        "uid": "user123",
        "token": "valid-token",
        "refreshToken": "refresh-token"
    }

    res = client.post("/store-google-token", json=payload)
    assert res.status_code == 200
    assert "Google token stored successfully" in res.get_data(as_text=True)

@patch("routes.google_cal.auth.verify_id_token")
@patch("routes.google_cal.firestore_db")
@patch("routes.google_cal.build")
def test_get_calendar_events_success(mock_build, mock_firestore, mock_verify, client):
    mock_verify.return_value = {"uid": "user123"}

    mock_firestore.collection.return_value.document.return_value.get.return_value.to_dict.return_value = {
        "googleTokens": {
            "accessToken": "valid",
            "refreshToken": "refresh",
            "tokenUri": "https://oauth2.googleapis.com/token",
            "clientId": "id",
            "clientSecret": "secret",
            "scopes": ["https://www.googleapis.com/auth/calendar.events"]
        }
    }

    mock_service = MagicMock()
    mock_service.events.return_value.list.return_value.execute.return_value = {
        "items": [{"summary": "Mock Event"}]
    }
    mock_build.return_value = mock_service

    res = client.get("/get-calendar-events", headers={"Authorization": "Bearer dummy-token"})
    assert res.status_code == 200
    assert "Mock Event" in str(res.get_json())

@patch("routes.google_cal.firestore_db")
@patch("routes.google_cal.create_calendar_event")
def test_schedule_interview_success(mock_create_event, mock_firestore, client):
    mock_create_event.return_value = {
        "id": "event123",
        "htmlLink": "http://calendar-link",
        "hangoutLink": "http://meet"
    }

    mock_firestore.collection.return_value.document.return_value.get.side_effect = [
        MagicMock(to_dict=lambda: {
            "first_name": "Rec", "last_name": "Ruiter", "email": "recruiter@example.com",
            "company_name": "TechCo", "googleTokens": {
                "accessToken": "tok", "refreshToken": "refresh", "tokenUri": "", "clientId": "",
                "clientSecret": "", "scopes": ["https://www.googleapis.com/auth/calendar.events"]
            }
        }),
        MagicMock(to_dict=lambda: {
            "first_name": "App", "last_name": "Lican", "email": "applicant@example.com",
            "googleTokens": {
                "accessToken": "tok", "refreshToken": "refresh", "tokenUri": "", "clientId": "",
                "clientSecret": "", "scopes": ["https://www.googleapis.com/auth/calendar.events"]
            }
        })
    ]

    res = client.post(
        "/schedule-interview/recruiter123/job456/applicant789",
        json={
            "date": datetime.utcnow().isoformat(),
            "jobTitle": "Backend Dev",
            "type": "video",
            "applicantEmail": "applicant@example.com"
        }
    )

    assert res.status_code == 200
    assert "event_link" in res.get_json()
