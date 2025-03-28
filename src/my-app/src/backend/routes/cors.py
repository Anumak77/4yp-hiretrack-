from flask import Flask
from flask_cors import CORS

def init_cors(app):
    CORS(app, resources={
        r"/store-google-token": {
            "origins": ["http://localhost:3000"],
            "methods": ["POST"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })