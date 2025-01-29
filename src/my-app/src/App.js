import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Navbar from './components/Navbar';
import Login from './SignUp/Login';
import Signup from './SignUp/Signup';
import Profile from './pages/profile';
import JobDetails from './pages/job-details';
import JobSearch from './pages/JobSearch';
import DashJobseeker from './pages/dashboard-jobseeker';
import DashRecruiter from './pages/dashboard-recruiter';
import JobTrackerJobseeker from './pages/JobTracker-jobseeker';
import JobTrackerRecruiter from './pages/JobTracker-recruiter';
import RecruiterSearch from './pages/RecruiterSearch';
import JobSeekerDetails from './pages/jobseeker-details';




function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}

function MainApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
  }, []);

  const location = useLocation();
  const hideNavbar = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/job-details" element={<JobDetails />} />
        <Route path="/jobseeker-details" element={<JobSeekerDetails />} />
        
        <Route path="/job-search" element={<JobSearch />} /> 
        <Route path="/recruiter-search" element={<RecruiterSearch />} />
        <Route path="/dashboard_jobseeker" element={<DashJobseeker />} />
        <Route path="/dashboard-recruiter" element={<DashRecruiter />} />
        <Route path="/jobtracker-jobseeker" element={<JobTrackerJobseeker />} />
        <Route path="/jobtracker-recruiter" element={<JobTrackerRecruiter />} />

        
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        
      </Routes>
    </>
  );
}

export default App;
