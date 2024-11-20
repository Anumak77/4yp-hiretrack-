import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './SignUp/Login';
import Signup from './SignUp/Signup';
import Profile from './pages/profile';
import CVManagement from './pages/cv-management';
import JobTracker from './pages/job-tracker';
import RecruiterSearch from './pages/recruiter-search';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cv-management" element={<CVManagement />} />
        <Route path="/job-tracker" element={<JobTracker />} />
        <Route path="/recruiter-search" element={<RecruiterSearch />} />
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
