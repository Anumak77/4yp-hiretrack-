import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Flask
from flask_cors import CORS
from routes.cors import init_cors


def test_init_cors_sets_headers():
    app = Flask(__name__)
    init_cors(app)

    client = app.test_client()

    @app.route('/test', methods=["GET", "OPTIONS"])
    def test_route():
        return "Hello", 200

    response = client.options(
        '/test',
        headers={
            'Origin': 'http://localhost:3000',
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
    )

    assert response.status_code == 200
    assert response.headers.get('Access-Control-Allow-Origin') == 'http://localhost:3000'
    assert 'Access-Control-Allow-Methods' in response.headers
    assert 'Access-Control-Allow-Headers' in response.headers
    assert response.headers.get('Access-Control-Allow-Credentials') == 'true'
