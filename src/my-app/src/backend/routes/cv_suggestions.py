from flask import Blueprint, request, jsonify
import openai
import base64
from PyPDF2 import PdfReader
import io

cv_suggestions_bp = Blueprint("cv_suggestions", __name__)

openai.api_key = "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"

@cv_suggestions_bp.route("/cv-suggestions", methods=["POST"])
def cv_suggestions():
    try:
        data = request.json
        base64_pdf = data.get("cv")
        job_description = data.get("jobDescription", "")
        job_requirements = data.get("jobRequirment", "")
        job_title = data.get("jobTitle", "")

        if not base64_pdf:
            return jsonify({"error": "No CV provided"}), 400

        #  Decode PDF
        pdf_data = base64.b64decode(base64_pdf)
        pdf_file = io.BytesIO(pdf_data)
        reader = PdfReader(pdf_file)
        cv_text = "\n".join([page.extract_text() for page in reader if page.extract_text()])

        #  GPT Prompt
        prompt = f"""
You are a professional CV coach. A user is applying for the following job:

Job Title: {job_title}
Description: {job_description}
Requirements: {job_requirements}

Here is their current CV content:
{cv_text}

Provide clear suggestions on how they can improve their CV to better match this job. Be honest, constructive, and specific. List changes for different sections (e.g., skills, experience, summary, formatting).
"""

        #  Call OpenAI
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",  # or "gpt-4"
            messages=[
                {"role": "system", "content": "You are a helpful and professional CV reviewer."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000,
        )

        suggestions = response['choices'][0]['message']['content']
        return jsonify({"suggestions": suggestions})

    except Exception as e:
        print(f"[ERROR] CV Suggestion failed: {e}")
        return jsonify({"error": str(e)}), 500
