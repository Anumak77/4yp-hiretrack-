import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Navbar from './components/Navbar';
import Login from './SignUp/Login';
import Signup from './SignUp/Signup';
import JobDetails from './jobseekers/job-details';
import JobSearch from './jobseekers/JobSearch';
import DashJobseeker from './jobseekers/dashboard-jobseeker';
import DashRecruiter from './recruiters/dashboard-recruiter';
import JobTrackerJobseeker from './jobseekers/JobTracker-jobseeker';
import JobTrackerRecruiter from './recruiters/JobTracker-recruiter';
import RecruiterSearch from './recruiters/RecruiterSearch';
import JobSeekerDetails from './jobseekers/jobseeker-details';
import JobSeekerChat from './chat/jobseekerchat';
import PostJob from './recruiters/postjob';
import ViewJobPostings from './recruiters/viewjob-postings';



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
        <Route path="/job-details" element={<JobDetails />} />
        <Route path="/jobseeker-details" element={<JobSeekerDetails />} />
        <Route path="/jobseekerchat" element={<JobSeekerChat />} />
        <Route path="/createpost" element={<PostJob />} />
        <Route path="/viewjobpostings" element={<ViewJobPostings />} />

        
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
