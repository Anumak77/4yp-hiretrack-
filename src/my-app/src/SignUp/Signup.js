import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { NavLink, useNavigate } from 'react-router-dom';
import { firebaseapp } from '../components/firebaseconfigs';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import '../components/style.css';

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [first_name, setfirstName] = useState('');
  const [last_name, setlastName] = useState('');
  const [location, setlocation] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [userType, setUserType] = useState('Job Seeker'); 
  const auth = getAuth(firebaseapp);
  const firestore = getFirestore(firebaseapp);

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: first_name +" "+ last_name });
      const userRef = doc(firestore, "users", user.uid);

      const userData = {
        uid: user.uid,
        first_name: first_name,
        last_name: last_name,
        name: first_name + last_name,
        email: user.email,
        userType: userType,
        createdAt: new Date().toISOString(), 
        location: location
      };

      await setDoc(userRef, userData);

      console.log(`User: ${first_name + " " + last_name}, Email: ${user.email}, Role: ${userType}`);
      navigate('/login');
    } catch (err) {
      setError(err.message);
      console.error('Error during signup:', err.message);
    }
  };

  return (
    <main className="main-container">
      <section className="section-container">
        <h1 className="heading">HireTrack</h1>
        
        {error && <p className="error-text">{error}</p>}

        <form>
          <div style={{ padding: "10px 30px 30px 10px" }}>
            <label htmlFor="name" className="label">First Name</label>
            <input
              id="name"
              type="text"
              value={first_name}
              onChange={(e) => setfirstName(e.target.value)}
              placeholder="Enter your first name"
              required
              className="input"
            />
          </div>

          <div style={{ padding: "10px 30px 30px 10px" }}>
            <label htmlFor="name" className="label">Last Name</label>
            <input
              id="name"
              type="text"
              value={last_name}
              onChange={(e) => setlastName(e.target.value)}
              placeholder="Enter your last name"
              required
              className="input"
            />
          </div>

          <div style={{ padding: "10px 30px 30px 10px" }}>
            <label htmlFor="email-address" className="label">Email address</label>
            <input
              type="email"
              id="email-address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="input"
            />
          </div>

          <div style={{ padding: "10px 30px 30px 10px" }}>
            <label htmlFor="password" className="label">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="input"
            />
          </div>

          <div style={{ padding: "10px 30px 10px 10px", textAlign: "left" }}>
            <label className="label">I am a:</label>
            <div className="user-type-container">
              <label className="radio-label">
                <input
                  type="radio"
                  name="userType"
                  value="Job Seeker"
                  checked={userType === 'Job Seeker'}
                  onChange={(e) => setUserType(e.target.value)}
                />
                Job Seeker
              </label>

              <label className="radio-label">
                <input
                  type="radio"
                  name="userType"
                  value="Recruiter"
                  checked={userType === 'Recruiter'}
                  onChange={(e) => setUserType(e.target.value)}
                />
                Recruiter
              </label>
            </div>
          </div>

          <div style={{ padding: "10px 30px 30px 10px" }}>
            <button type="submit" onClick={onSubmit} className="button">Sign up</button>
          </div>
        </form>

        <p>
          Already have an account?{' '}
          <NavLink to="/login" className="link">Sign in</NavLink>
        </p>
      </section>
    </main>
  );
};

export default Signup;

