import React, { useEffect, useState } from 'react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import '../components/style.css';


const Home = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setName(user.displayName || 'Guest');
      } else {
        navigate('/');
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
    <main className="main-container">
      <section className="section-container">
        <h1 className="heading">Hey, welcome back {name}!</h1>
        <p className="text">We're glad to have you here.</p>
        <button
          onClick={handleLogout}
          className="button"
          onMouseOver={(e) => (e.target.style.backgroundColor = '#e0559a')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#F87060')}
        >
          Logout
        </button>
      </section>
    </main>
  );
};

export default Home;
