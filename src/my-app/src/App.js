import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

import NavbarJobseeker from './pages/jobseekers/NavbarJobseeker';
import NavbarRecruiters from './pages/recruiters/NavbarRecruiters';
import NavbarAdmin from './pages/admin/navbar-admin';

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
import EditJob from './pages/recruiters/edit-job';
import ViewJobPostings from './pages/recruiters/viewjob-postings';
import ViewApplicants from './pages/recruiters/ViewApplicants';

function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}

function MainApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || null);
  const [jobPostings, setJobPostings] = useState([
    { id: 1, title: 'Software Engineer', company: 'Google', location: 'New York', description: 'Develop scalable web applications.' },
    { id: 2, title: 'Product Manager', company: 'Microsoft', location: 'Seattle', description: 'Lead cross-functional teams to deliver product roadmaps.' },
    { id: 3, title: 'Data Scientist', company: 'Amazon', location: 'San Francisco', description: 'Analyze large datasets to generate insights.' }
  ]);

  const location = useLocation();
  const hideNavbar = location.pathname === '/login' || location.pathname === '/signup';

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userType = userDocSnap.data().userType;
            setUserRole((prevRole) => prevRole === 'Admin' ? 'Admin' : userType);
            localStorage.setItem('userRole', userType);
          } else {
            console.error("User data not found in Firestore.");
          }
        } catch (error) {
          console.error("Error fetching user role from Firestore:", error);
        }
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
        localStorage.removeItem('userRole');
      }
    });
  }, []);

  return (
    <>
      {!hideNavbar && isAuthenticated && (
        userRole === 'Admin' ? (
          <NavbarAdmin />
        ) : (
          <>
            {userRole === 'Job Seeker' && <NavbarJobseeker />}
            {userRole === 'Recruiter' && <NavbarRecruiters />}
          </>
        )
      )}

      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<NavbarAdmin />} />
        <Route path="/dashboard-jobseeker" element={<DashJobseeker />} />
        <Route path="/dashboard-recruiter" element={<DashRecruiter />} />
        <Route path="/job-details" element={<JobDetails />} />
        <Route path="/job-search" element={<JobSearch />} />
        <Route path="/jobtracker-jobseeker" element={<JobTrackerJobseeker />} />
        <Route path="/jobtracker-recruiter" element={<JobTrackerRecruiter />} />
        <Route path="/recruiter-search" element={<RecruiterSearch />} />
        <Route path="/jobseeker-details" element={<JobSeekerDetails />} />
        <Route path="/jobseekerchat" element={<JobSeekerChat />} />
        <Route path="/createpost" element={<PostJob />} />
        <Route path="/viewjobpostings" element={<ViewJobPostings jobPostings={jobPostings} setJobPostings={setJobPostings} />} />
        <Route path="/edit-job/:id" element={<EditJob />} />
        <Route path="/view-applicants/:id" element={<ViewApplicants />} />
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </>
  );
}

export default App;