import React, { useEffect, useState } from 'react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [name, setName] = useState(''); // State to store the user's name

  useEffect(() => {
    // Fetch the currently signed-in user's name
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setName(user.displayName || 'Guest'); // Use displayName or default to 'Guest'
      } else {
        navigate('/'); // Redirect to login if no user is signed in
      }
    });
  }, [navigate]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate('/');
        console.log('Signed out successfully');
      })
      .catch((error) => {
        console.error('Error signing out:', error);
      });
  };

  return (
    <main
      style={{
        height: '100vh',
        backgroundColor: '#f8c8dc', // Light pink background
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <section
        style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '8px',
          boxShadow: '0px 4px 12px rgba(200, 120, 140, 0.3)', // Soft pink shadow
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%',
        }}
      >
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '20px',
            color: '#ff69b4', // Pink text color
          }}
        >
          Hey, welcome back {name}!
        </h1>
        <p
          style={{
            fontSize: '16px',
            color: '#555',
            marginBottom: '30px',
          }}
        >
          We're glad to have you here.
        </p>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ff69b4', // Pink button background
            color: '#f5f5f5', // Light gray text color
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            boxShadow: '0px 4px 8px rgba(200, 120, 140, 0.3)', // Soft pink shadow
            transition: 'background-color 0.3s ease',
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#e0559a')} // Darker pink on hover
          onMouseOut={(e) => (e.target.style.backgroundColor = '#ff69b4')} // Original pink on mouse out
        >
          Logout
        </button>
      </section>
    </main>
  );
};

export default Home;
