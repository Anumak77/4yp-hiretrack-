from flask import Flask
from flask_cors import CORS

def init_cors(app):
    CORS(app, resources={
        r"/*": {  
            "origins": ["http://localhost:3000"],  
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True  
        }
    })