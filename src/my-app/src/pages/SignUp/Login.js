import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { NavLink, useNavigate } from 'react-router-dom';
import { firebaseapp } from "../../components/firebaseconfigs";
import axios from 'axios';
import '../../components/style.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [Loading, setLoading] = useState(false);
  const auth = getAuth(firebaseapp);
  const db = getFirestore(firebaseapp);  // Firestore reference

  const onLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user role from Firestore
      const userDocRef = doc(db, "users", user.uid); // Get user document
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const userType = userDocSnap.data().userType; // Get userType from Firestore
        console.log("User Role:", userType);

        // Store role in localStorage
        localStorage.setItem('userRole', userType);

        // Redirect based on role
        if (userType === 'Job Seeker') {
          navigate('/dashboard_jobseeker');
        } else if (userType === 'Recruiter') {
          navigate('/dashboard_recruiter');
        } else if (userType === 'Admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError("User data not found. Please contact support.");
      }

    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (error.code === 'auth/user-not-found') {
        setError('No user found with this email address.');
      } else {
        setError('Failed to log in. Please try again later.');
      }
      console.error('Login Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-main-container">
      <section className="login-section-container">
        <h1 className="login-heading">HireTrack</h1>

        {error && <p className="login-error-text">{error}</p>}

        <form>
          <div style={{ padding: "10px 30px 0px 10px" }}>
            <label htmlFor="email-address" className="login-label">Email address</label>
            <input
              id="email-address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="login-input"
            />
          </div>

          <div style={{ padding: "10px 30px 0px 10px" }}>
            <label htmlFor="password" className="login-label">Password </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="login-input"
            /> 
          </div>

          <div style={{ padding: "10px 10px 10px 10px" }}>
            <button type="submit" onClick={onLogin} className="login-button">
              Login
            </button>
          </div>
        </form>

        <p>
          No account yet?{' '}
          <NavLink to="/signup" className="login-link">Sign up</NavLink>
        </p>
      </section>
    </main>
  );
};

export default Login;
