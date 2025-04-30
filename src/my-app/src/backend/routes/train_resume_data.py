# backend/routes/train_resume_data.py

from flask import Blueprint, jsonify

train_resume_bp = Blueprint('train_resume', __name__)

@train_resume_bp.route('/train-resume-model', methods=['GET'])
def train_model():
    return jsonify({"message": "Training endpoint hit"}), 200
