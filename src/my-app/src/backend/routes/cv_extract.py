from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from train_resume_parser import extract_info, patterns  # 👈 use your real parser
import fitz  # PyMuPDF
import docx2txt
import os

cv_extract_bp = Blueprint('cv_extract', __name__)

@cv_extract_bp.route('/upload-cv', methods=['POST'])
def upload_cv():
    try:
        file = request.files.get('file')
        if not file:
            return jsonify({"error": "No file uploaded"}), 400

        filename = secure_filename(file.filename)
        file_ext = filename.split('.')[-1].lower()

        # --- Extract text ---
        if file_ext == 'pdf':
            with fitz.open(stream=file.read(), filetype='pdf') as pdf:
                text = "\n".join(page.get_text() or "" for page in pdf)
        elif file_ext == 'docx':
            # Save to temp file first
            temp_path = f"temp_uploads/{filename}"
            os.makedirs("temp_uploads", exist_ok=True)
            file.save(temp_path)
            text = docx2txt.process(temp_path)
            os.remove(temp_path)
        else:
            return jsonify({"error": "Unsupported file type"}), 400

        extracted = extract_info(text, patterns, filename)
        return jsonify(extracted)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
