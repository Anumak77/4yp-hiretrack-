from flask import Blueprint, jsonify
from train_resume_parser import process_resumes


train_resume_bp = Blueprint('train_resume', __name__)

@train_resume_bp.route('/resume-dataset', methods=['GET'])
def get_dataset():
    try:
        data_dir = './resume_dataset/raw_data'  # your existing source
        all_data = process_resumes(data_dir)
        return jsonify(all_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
