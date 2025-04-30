from flask import Blueprint, request, jsonify
from firebase_admin import firestore
from datetime import datetime
from config import firestore_db

jobseekertracker_bp = Blueprint('jobseekertracker', __name__)

@jobseekertracker_bp.route('/get-all-job-application-trends', methods=['GET'])
def get_all_job_application_trends():
    try:
        recruiters = firestore_db.collection('recruiters').stream()
        trends = {}

        for recruiter in recruiters:
            recruiter_id = recruiter.id
            jobpostings = firestore_db.collection(f'recruiters/{recruiter_id}/jobposting').stream()

            for job in jobpostings:
                job_data = job.to_dict()
                job_title = job_data.get('Title', 'Unknown')
                location = job_data.get('Location', 'Unknown')
                applicants = firestore_db.collection(
                    f'recruiters/{recruiter_id}/jobposting/{job.id}/applicants'
                ).stream()

                for app in applicants:
                    applied_at = app.to_dict().get('appliedAt')
                    if not applied_at:
                        continue
                    try:
                        month = datetime.fromisoformat(applied_at).strftime('%B')
                    except:
                        month = 'Unknown'
                    key = (job_title, location, month)
                    trends[key] = trends.get(key, 0) + 1

        results = [
            {
                "jobTitle": jt,
                "location": loc,
                "month": mo,
                "totalApplications": count
            }
            for (jt, loc, mo), count in trends.items()
        ]

        return jsonify(results), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@jobseekertracker_bp.route('/get-job-application-trends', methods=['GET'])
def get_job_application_trends():
    try:
        recruiter_id = request.args.get('recruiter_id')
        if not recruiter_id:
            return jsonify({"error": "recruiter_id is required"}), 400

        postings_ref = firestore_db.collection(f'recruiters/{recruiter_id}/jobposting').stream()
        trends = {}

        for posting in postings_ref:
            job = posting.to_dict()
            job_title = job.get('Title', 'Unknown')
            job_id = posting.id

            applicants = firestore_db.collection(
                f'recruiters/{recruiter_id}/jobposting/{job_id}/applicants'
            ).stream()

            for app in applicants:
                applied_at = app.to_dict().get('appliedAt')
                if not applied_at:
                    continue
                try:
                    month = datetime.fromisoformat(applied_at).strftime('%B')
                except:
                    continue
                key = (job_title, month)
                trends[key] = trends.get(key, 0) + 1

        result = [
            {"jobTitle": jt, "month": mo, "applications": count}
            for (jt, mo), count in trends.items()
        ]

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@jobseekertracker_bp.route('/get-global-job-application-trends', methods=['GET'])
def get_global_job_application_trends():
    try:
        applications_ref = firestore_db.collection('applications').stream()
        trends = {}

        for app in applications_ref:
            data = app.to_dict()
            job_title = data.get('jobTitle', 'Unknown')
            applied_at = data.get('appliedAt')
            if not applied_at:
                continue

            try:
                month = datetime.fromisoformat(applied_at).strftime('%B')
            except:
                continue

            key = (job_title, month)
            trends[key] = trends.get(key, 0) + 1

        result = [
            {"jobTitle": job_title, "month": month, "applications": count}
            for (job_title, month), count in trends.items()
        ]

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
