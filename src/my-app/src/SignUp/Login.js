import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { NavLink, useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        navigate('/profile');
        console.log(user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
  };

  return (
    <>
      <main
        style={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f8c8dc', // Pink background
        }}
      >
        <section
          style={{
            background: 'white',
            padding: '30px', // Increased padding
            borderRadius: '8px',
            boxShadow: '0px 4px 12px rgba(200, 120, 140, 0.3)', // Softer shadow matching pink theme
            maxWidth: '400px',
            width: '100%',
          }}
        >
          <div>
            <p
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: '20px',
                color: '#ff69b4', // Pink text color for heading
              }}
            >
              HireTrack
            </p>

            <form>
              <div style={{ marginBottom: '15px' }}>
                <label
                  htmlFor="email-address"
                  style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontWeight: 'bold',
                    fontSize: '14px', // Standardized font size
                    lineHeight: '1.5', // Improved spacing
                  }}
                >
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  placeholder="Email address"
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label
                  htmlFor="password"
                  style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontWeight: 'bold',
                    fontSize: '14px', // Standardized font size
                    lineHeight: '1.5', // Improved spacing
                  }}
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                  }}
                />
              </div>

              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={onLogin}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#ff69b4', // Pink button background
                    color: '#f5f5f5', // Softer light gray text for button
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '10px', // Added margin for spacing
                    boxShadow: '0px 4px 8px rgba(200, 120, 140, 0.3)', // Soft pink shadow
                    transition: 'background-color 0.3s ease', // Smooth hover effect
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = '#e0559a')} // Darker pink hover
                  onMouseOut={(e) => (e.target.style.backgroundColor = '#ff69b4')} // Reset to original pink
                >
                  Login
                </button>
              </div>
            </form>

            <p style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px' }}>
              No account yet?{' '}
              <NavLink to="/signup" style={{ color: '#e0559a', textDecoration: 'none' }}>
                Sign up
              </NavLink>
            </p>
          </div>
        </section>
      </main>
    </>
  );
};

export default Login;