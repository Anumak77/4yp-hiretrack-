from flask import Blueprint, request, jsonify
from firebase_admin import auth
from config import firestore_db
from flask_cors import CORS
from firebase_admin import auth, firestore 

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        user_type = data.get('userType')
        phone_number = data.get('phone_number', '')
        location = data.get('location', '')
        company_name = data.get('company_name', '')

        print("Received data:", data)

        if not email or not password or not first_name or not last_name:
            return jsonify({"error": "All fields are required"}), 400

        # Create user in Firebase Authentication
        user = auth.create_user(
            email=email,
            password=password,
            display_name=f"{first_name} {last_name}",
        )

        print("Created user:", user.uid)
        firestore_db = firestore.client()

        user_data = {
            "uid": user.uid,
            "email": email,
            "first_name": first_name,
            "last_name": last_name,
            "userType": user_type,
            "phone_number": phone_number,
            "location": location,
            "createdAt": firestore.SERVER_TIMESTAMP
        }

        if user_type == 'Recruiter':
            if not company_name:
                return jsonify({"error": "Company name is required for recruiters"}), 400
            user_data["company_name"] = company_name
        if user_type == 'Recruiter':
            user_ref = firestore_db.collection('recruiters').document(user.uid)
        elif user_type == 'Job Seeker':
            user_ref = firestore_db.collection('jobseekers').document(user.uid)
        else:
            return jsonify({"error": "Invalid user type"}), 400

        user_ref.set(user_data)

        firestore_db.collection('users').document(user.uid).set(user_data)

        return jsonify({"message": "User created successfully", "uid": user.uid}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        id_token = data.get('idToken')  # Get the Firebase ID token

        if not id_token:
            return jsonify({"error": "ID token is required"}), 400

        
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token.get('uid')

        
        user_ref = firestore_db.collection('users').document(uid).get()
        if not user_ref.exists:
            return jsonify({"error": "User not found in Firestore"}), 404

        user_data = user_ref.to_dict()

        # Return user data on successful login
        return jsonify({
            "message": "Login successful",
            "uid": uid,
            "userType": user_data.get("userType"),
            "firstName": user_data.get("first_name"),
            "lastName": user_data.get("last_name"),
            "email": decoded_token.get('email'),  
        }), 200

    except auth.UserNotFoundError:
        return jsonify({"error": "User not found"}), 404
    except auth.InvalidIdTokenError:
        return jsonify({"error": "Invalid ID token"}), 401
    except Exception as e:
        print(f"Error in /login route: {str(e)}")
        return jsonify({"error": str(e)}), 500