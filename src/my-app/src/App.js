import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Navbar from './components/Navbar';
import Login from './SignUp/Login';
import Signup from './SignUp/Signup';
import Profile from './pages/profile';
import CVManagement from './pages/cv-management';
import JobDetails from './pages/job-details';
import RecruiterSearch1v from './pages/RecruiterSearchWithMoreInfo';

import DashJobseeker from './pages/dashboard-jobseeker';
import DashRecruiter from './pages/dashboard-recruiter';
import JobTrackerJobseeker from './pages/JobTracker-jobseeker';
import JobTrackerRecruiter from './pages/JobTracker-recruiter';





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
        <Route path="/cv-management" element={<CVManagement />} />
        <Route path="/job-details" element={<JobDetails />} />

        <Route path="/recruiter-search-1v" element={<RecruiterSearch1v />} />

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
