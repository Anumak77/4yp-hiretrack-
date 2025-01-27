import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { NavLink, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { firebaseapp } from '../components/firebaseconfigs';

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState(''); 
  const [password, setPassword] = useState('');
  const [Error ,setError] = useState('');
  const [userType, setUserType] = useState('Job Seeker'); 
  const auth = getAuth(firebaseapp);

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      console.log(`User: ${name}, Email: ${user.email}, Role: ${userType}`);
      navigate('/login');
    } catch (err) {
      if (err.code === 'auth/weak-password') {
        setError('The password is too weak.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('The email address is already in use.');
      } else {
        setError(err.message);
        console.error('Error during signup:', err.message);
      }
    }
  };

  return (
    <main style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8c8dc'}} >
      <section style={{ background: 'white', padding: '30px 40px', borderRadius: '8px', boxShadow: '0px 4px 12px rgba(200, 120, 140, 0.3)', maxWidth: '400px', width: '100%'}} >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px', color: '#ff69b4'}} > HireTrack </h1>

          <form>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="name" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}> Name </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc'}}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="email-address" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Email address
              </label>
              <input
                type="email"
                id="email-address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc'}}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc'}}
              />
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                type="submit"
                onClick={onSubmit}
                style={{ padding: '10px 20px', backgroundColor: '#ff69b4', color: '#f5f5f5', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px', boxShadow: '0px 4px 8px rgba(200, 120, 140, 0.3)' }}
              >
                Sign up
              </button>
            </div>
          </form>

          <p style={{ marginTop: '15px', textAlign: 'center' }}>
            Already have an account?{' '}
            <NavLink to="/login" style={{ color: '#e0559a', textDecoration: 'none' }}>
              Sign in
            </NavLink>
          </p>

          {/* User Type Selection */}
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Are you a:</p>
            <button
              onClick={() => setUserType(userType === 'Job Seeker' ? 'Recruiter' : 'Job Seeker')}
              style={{ padding: '8px 15px', backgroundColor: '#e0559a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', boxShadow: '0px 3px 6px rgba(200, 120, 140, 0.3)' }}
            >
              {userType === 'Job Seeker' ? 'Switch to Recruiter' : 'Switch to Job Seeker'}
            </button>
            <p style={{ marginTop: '10px', fontWeight: 'bold', color: '#e0559a' }}>
              Selected Role: {userType}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Signup;
