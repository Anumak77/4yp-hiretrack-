import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { NavLink, useNavigate } from 'react-router-dom';
import { firebaseapp } from "../components/firebaseconfigs";
import '../components/style.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [Loading, setLoading] = useState(false);
  const auth = getAuth(firebaseapp);

  const onLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Logged in:', user);
      navigate('/profile');
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (error.code === 'auth/user-not-found') {
        setError('No user found with this email address.');
      } else {
        setError('Failed to log in. Please try again later.');
      }
      console.error('Login Error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-container">
      <section className="section-container">
        <h1 className="heading">HireTrack</h1>

        {error && <p className="error-text">{error}</p>}

        <form>
        <div style={{ padding: "10px 30px 20px 10px" }}>
        <label htmlFor="email-address" className="label">Email address</label>
            <input
              id="email-address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="input"
            />
          </div>

          <div style={{ padding: "10px 30px 30px 10px" }}>
          <label htmlFor="password" className="label">Password </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="input"
            /> 
          </div>

          <div style={{ padding: "10px 10px 10px 10px" }}>
            <button type="submit" onClick={onLogin} className="button">
              Login
            </button>
          </div>
        </form>

        <p>
          No account yet?{' '}
          <NavLink to="/signup" className="link">Sign up</NavLink>
        </p>
      </section>
    </main>
  );
};

export default Login;
