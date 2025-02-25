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

  const location = useLocation();
  const hideNavbar =
    location.pathname === '/login' || location.pathname === '/signup';

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);

        // --------------------------
        // Fetch role from Firebase
        // --------------------------

        // Using Firestore “users” collection:
        // const userDoc = await getDoc(doc(db, "users", user.uid));
        // if (userDoc.exists()) {
        //   const data = userDoc.data();
        //   setUserRole(data?.role); // e.g. "JobSeeker" or "Recruiter"
        // }

        // For demo, we pretend we got "Recruiter"
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
        <Route path="/viewjobpostings" element={<ViewJobPostings />} />

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
