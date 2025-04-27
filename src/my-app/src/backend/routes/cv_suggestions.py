from flask import Blueprint, request, jsonify
import base64
from PyPDF2 import PdfReader
import io
import traceback
import requests

cv_suggestions_bp = Blueprint("cv_suggestions", __name__)

API_KEY = "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"
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
    "User-Agent": "HireTrack/1.0",  
}



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

        pdf_data = base64.b64decode(base64_pdf)
        pdf_file = io.BytesIO(pdf_data)
        reader = PdfReader(pdf_file)
        cv_text = "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
        print("[INFO] Extracted CV Text:", cv_text[:300])
        prompt = f"""
You are a professional CV coach. A user is applying for:

Job Title: {job_title}
Description: {job_description}
Requirements: {job_requirements}

Here is their current CV:
{cv_text}

Give only 5 short bullet points with the top improvements they should make.
Be very concise and high-impact.

Example:
- Add measurable results to experience bullet points.
- Highlight community-related projects or volunteer work.
- Tailor summary to internship goals.
"""


        payload = {
            "model": "mistralai/mistral-7b-instruct",
            "messages": [
                {"role": "system", "content": "You are a helpful and professional CV reviewer."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 1000
        }






        response = requests.post(OPENROUTER_URL, json=payload, headers=HEADERS)
        response.raise_for_status()
        result = response.json()
        suggestions = result["choices"][0]["message"]["content"]

        return jsonify({"suggestions": suggestions})
    
    
    except requests.exceptions.HTTPError as e:
        print(f"[HTTP ERROR] {e}")
        print(f"[OpenRouter Response Text] {e.response.text}") 
        return jsonify({"error": f"HTTP Error: {e.response.text}"}), 500


