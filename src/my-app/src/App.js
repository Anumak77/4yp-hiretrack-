import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import NavbarJobseeker from './pages/jobseekers/NavbarJobseeker';
import NavbarRecruiters from './pages/recruiters/NavbarRecruiters';

import Login from './pages/SignUp/Login';
import Signup from './pages/SignUp/Signup';
import JobDetails from './pages/jobseekers/job-details';
import JobSearch from './pages/jobseekers/JobSearch';
import DashJobseeker from './pages/jobseekers/dashboard-jobseeker';
import DashRecruiter from './pages/recruiters/dashboard-recruiter';
import JobTrackerJobseeker from './pages/jobseekers/JobTracker-jobseeker';
import JobTrackerRecruiter from './pages/recruiters/JobTracker-recruiter';
import RecruiterSearch from './pages/recruiters/RecruiterSearch';
import JobSeekerDetails from './pages/recruiters/jobseeker-details';
import JobSeekerChat from './pages/chat/jobseekerchat';
import PostJob from './pages/recruiters/postjob';
import ViewJobPostings from './pages/recruiters/ViewJobPostings';

import EditJob from './pages/recruiters/editjobposting';
import ViewJobPostings from './pages/recruiters/viewjob-postings';
import EditJob from './pages/recruiters/edit-job';

function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}

function MainApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // "JobSeeker" | "Recruiter" | null

  const [jobPostings, setJobPostings] = useState([
    { id: 1, title: 'Software Engineer', company: 'Google', location: 'New York', description: 'Develop scalable web applications.' },
    { id: 2, title: 'Product Manager', company: 'Microsoft', location: 'Seattle', description: 'Lead cross-functional teams to deliver product roadmaps.' },
    { id: 3, title: 'Data Scientist', company: 'Amazon', location: 'San Francisco', description: 'Analyze large datasets to generate insights.' }
  ]);

  const location = useLocation();
  const hideNavbar =
    location.pathname === '/login' || location.pathname === '/signup';

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserRole('Recruiter');
      } else {
        setIsAuthenticated(false);
        setUserRole('Recruiter');
      }
    });
  }, []);

  return (
    <>
      {!hideNavbar && isAuthenticated && (
        <>
          {userRole === 'JobSeeker' && <NavbarJobseeker />}
          {userRole === 'Recruiter' && <NavbarRecruiters />}
        </>
      )}

      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/job-details" element={<JobDetails />} />
        <Route path="/jobseeker-details" element={<JobSeekerDetails />} />
        <Route path="/jobseekerchat" element={<JobSeekerChat />} />
        <Route path="/createpost" element={<PostJob />} />
        <Route path="/viewjobpostings" element={<ViewJobPostings jobPostings={jobPostings} setJobPostings={setJobPostings} />} />
        <Route path="/editjobpostings/:id" element={<EditJob jobPostings={jobPostings} setJobPostings={setJobPostings} />} />

        <Route path="/job-search" element={<JobSearch />} />
        <Route path="/recruiter-search" element={<RecruiterSearch />} />
        <Route path="/dashboard_jobseeker" element={<DashJobseeker />} />
        <Route path="/dashboard-recruiter" element={<DashRecruiter />} />
        <Route path="/jobtracker-jobseeker" element={<JobTrackerJobseeker />} />
        <Route path="/jobtracker-recruiter" element={<JobTrackerRecruiter />} />
        <Route path="/edit-job/:id" element={<EditJob />} />

        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </>
  );
}

export default App;
