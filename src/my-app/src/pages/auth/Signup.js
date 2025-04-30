import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { NavLink, useNavigate } from 'react-router-dom';
import { firebaseapp } from '../../components/firebaseconfigs';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import '../../components/style.css';

const countryOptions = [
  "United States", "United Kingdom", "India", "Canada", "Germany",
  "France", "Australia", "Armenia", "Singapore", "United Arab Emirates", "Ireland"
];

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [location, setLocation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [userType, setUserType] = useState('Job Seeker');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userData = {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        userType,
        location: userType === 'Job Seeker' ? location : '',
        phone_number: phoneNumber,
        company_name: userType === 'Recruiter' ? companyName : '',
      };

      const response = await fetch('http://127.0.0.1:5000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`Signup failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Signup successful:', data);

      // Redirect on success
      navigate('/login');
    } catch (err) {
      // Fallback error message if no details come back from server
      setError(err.message || 'Signup failed. Please try again.');
      console.error('Signup error:', err);
    }
  };

  return (
    <main className="signup-main-container">
      <section className="signup-section-container">
        <h1 className="signup-heading">HireTrack</h1>

        {error && <p className="signup-error-text">{error}</p>}

        <form onSubmit={onSubmit}>
          <div style={{ padding: "10px 30px 10px 10px", textAlign: "left" }}>
            <label className="signup-label">I am a:</label>
            <div className="signup-user-type-container">
              <label className="signup-radio-label">
                <input
                  type="radio"
                  name="userType"
                  value="Job Seeker"
                  checked={userType === 'Job Seeker'}
                  onChange={(e) => setUserType(e.target.value)}
                />
                Job Seeker
              </label>

              <label className="signup-radio-label">
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

          <div style={{ padding: "10px 30px 0px 10px" }}>
            <label htmlFor="first-name" className="signup-label">First Name</label>
            <input
              id="first-name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              required
              className="signup-input"
            />
          </div>

          <div style={{ padding: "10px 30px 0px 10px" }}>
            <label htmlFor="last-name" className="signup-label">Last Name</label>
            <input
              id="last-name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name"
              required
              className="signup-input"
            />
          </div>

          <div style={{ padding: "10px 30px 0px 10px" }}>
            <label htmlFor="email" className="signup-label">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="signup-input"
            />
          </div>

          <div style={{ padding: "10px 30px 0px 10px" }}>
            <label htmlFor="password" className="signup-label">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="signup-input"
            />
          </div>

          {userType === 'Job Seeker' && (
            <>
              <div style={{ padding: "10px 5px 0px 10px" }}>
                <label htmlFor="location" className="signup-label">Location</label>
                <select
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="signup-location-dropdown"
                >
                  <option value="">Select a country</option>
                  {countryOptions.map((country, index) => (
                    <option key={index} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div style={{ padding: "10px 30px 0px 10px" }}>
                <label htmlFor="phone" className="signup-label">Phone Number</label>
                <input
                  id="phone"
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  required
                  className="signup-input"
                />
              </div>
            </>
          )}

          {userType === 'Recruiter' && (
            <>
              <div style={{ padding: "10px 30px 0px 10px" }}>
                <label htmlFor="company" className="signup-label">Company Name</label>
                <input
                  id="company"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter your company name"
                  required
                  className="signup-input"
                />
              </div>

              <div style={{ padding: "10px 30px 0px 10px" }}>
                <label htmlFor="phone" className="signup-label">Phone Number</label>
                <input
                  id="phone"
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  required
                  className="signup-input"
                />
              </div>
            </>
          )}

          <div style={{ padding: "10px 30px 0px 10px" }}>
            <button type="submit" className="signup-button">Sign up</button>
          </div>
        </form>

        <p>
          Already have an account?{' '}
          <NavLink to="/login" className="signup-link">Sign in</NavLink>
        </p>
      </section>
    </main>
  );
};

export default Signup;
