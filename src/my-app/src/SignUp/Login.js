import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { NavLink, useNavigate } from 'react-router-dom';
import { firebaseapp } from "../components/firebaseconfigs";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
    <main style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8c8dc' }} >
      <section
        style={{ background: 'white', padding: '30px 40px', borderRadius: '8px', boxShadow: '0px 4px 12px rgba(200, 120, 140, 0.3)', maxWidth: '400px', width: '100%'}}>
        <h1
          style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px', color: '#ff69b4' }}>
          HireTrack
        </h1>

        {error && (
          <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px', fontSize: '14px'}}>
            {error}
          </p>
        )}

        <form>
          <div style={{ marginBottom: '15px' }}>
            <label
              htmlFor="email-address"
              style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}
            >
              Email address
            </label>
            <input
              id="email-address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label
              htmlFor="password"
              style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              type="submit"
              onClick={onLogin}
              style={{ padding: '10px 20px', backgroundColor: '#ff69b4', color: '#f5f5f5', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px', boxShadow: '0px 4px 8px rgba(200, 120, 140, 0.3)'}}
            >
              Login
            </button>
          </div>
        </form>

        <p style={{ marginTop: '15px', textAlign: 'center' }}>
          No account yet?{' '}
          <NavLink to="/signup" style={{ color: '#e0559a', textDecoration: 'none' }}>
            Sign up
          </NavLink>
        </p>
      </section>
    </main>
  );
};

export default Login;