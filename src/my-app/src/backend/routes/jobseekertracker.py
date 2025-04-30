from flask import Blueprint, request, jsonify
from firebase_admin import firestore
from datetime import datetime
from config import firestore_db  

jobseekertracker_bp = Blueprint('jobseekertracker', __name__)

@jobseekertracker_bp.route('/get-all-job-application-trends', methods=['GET'])
def get_all_job_application_trends():
    try:
        recruiters_ref = firestore_db.collection('recruiters')
        recruiters = recruiters_ref.stream()

        trends = {}

        for recruiter in recruiters:
            recruiter_id = recruiter.id
            jobpostings_ref = firestore_db.collection(f'recruiters/{recruiter_id}/jobposting')
            jobpostings = jobpostings_ref.stream()

            for job in jobpostings:
                job_data = job.to_dict()
                job_id = job.id
                job_title = job_data.get('Title', 'Unknown')
                industry = job_data.get('Industry', 'Unknown')
                location = job_data.get('Location', 'Unknown')

                applicants_ref = firestore_db.collection(
                    f'recruiters/{recruiter_id}/jobposting/{job_id}/applicants'
                )
                applicants = applicants_ref.stream()

                for app in applicants:
                    applied_at = app.to_dict().get('appliedAt')
                    if not applied_at:
                        continue

                    try:
                        applied_month = datetime.fromisoformat(applied_at).strftime('%B')
                    except:
                        applied_month = 'Unknown'

                    key = (job_title, industry, location, applied_month)
                    trends[key] = trends.get(key, 0) + 1

        filter_job = request.args.get('jobTitle', '').lower()
        filter_industry = request.args.get('industry', '').lower()

        result = [
            {
                "jobTitle": jt,
                "industry": ind,
                "location": loc,
                "month": month,
                "totalApplications": count
            }
            for (jt, ind, loc, month), count in trends.items()
            if (filter_job in jt.lower()) and (filter_industry in ind.lower())
        ]

        result.sort(key=lambda x: x['totalApplications'], reverse=True)
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@jobseekertracker_bp.route('/get-global-job-application-trends', methods=['GET'])
def get_global_job_application_trends():
    try:
        applications_ref = firestore_db.collection('applications')
        applications = applications_ref.stream()

        trends = {}
        for app in applications:
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


@jobseekertracker_bp.route('/get-job-application-trends', methods=['GET'])
def get_job_application_trends():
    try:
        recruiter_id = request.args.get('recruiter_id')
        if not recruiter_id:
            return jsonify({"error": "recruiter_id is required"}), 400

        postings_ref = firestore_db.collection(f'recruiters/{recruiter_id}/jobposting')
        postings = postings_ref.stream()

        trends = {}
        print(f"[DEBUG] Recruiter ID: {recruiter_id}")

        for posting in postings:
            job = posting.to_dict()
            job_id = posting.id
            job_title = job.get('Title', 'Unknown')
            print(f"[DEBUG] Checking job: {job_title} ({job_id})")

            applicants_ref = firestore_db.collection(
                f'recruiters/{recruiter_id}/jobposting/{job_id}/applicants'
            )
            applicants = applicants_ref.stream()

            for app in applicants:
                applied_at = app.to_dict().get('appliedAt')
                if not applied_at:
                    continue
                try:
                    month = datetime.fromisoformat(applied_at).strftime('%B')
                except Exception as parse_error:
                    print(f"[WARN] Skipping invalid date: {applied_at} - {parse_error}")
                    continue

                key = (job_title, month)
                trends[key] = trends.get(key, 0) + 1

        result = [
            {"jobTitle": job_title, "month": month, "applications": count}
            for (job_title, month), count in trends.items()
        ]

        print("[DEBUG] Final trend result:", result)
        return jsonify(result), 200

    except Exception as e:
        print("[ERROR]", str(e))
        return jsonify({"error": str(e)}), 500
