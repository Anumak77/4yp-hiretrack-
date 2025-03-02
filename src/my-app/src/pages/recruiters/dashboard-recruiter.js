import React from 'react';
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import NavbarRecruiters from './NavbarRecruiters';
import NavbarAdmin from '../admin/navbar-admin';
import { useNavigate } from 'react-router-dom';
import '../../components/style.css';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashRecruiter = () => {
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || null);
  useEffect(() => {
    const auth = getAuth();
    auth.onAuthStateChanged((user) => {
      if (user) {
        const storedRole = localStorage.getItem('userRole');
        setUserRole(storedRole);
      }
    });
  }, []);

  const navigate = useNavigate();

  const jobPostings = [
    { id: 1, title: 'Software Engineer', views: 150, applications: 25 },
    { id: 2, title: 'Product Manager', views: 90, applications: 10 },
    { id: 3, title: 'Data Analyst', views: 120, applications: 18 },
  ];

  const totalJobs = jobPostings.length;
  const totalApplications = jobPostings.reduce((acc, job) => acc + job.applications, 0);
  const avgViewsPerJob = (jobPostings.reduce((acc, job) => acc + job.views, 0) / totalJobs).toFixed(2);

  const chartData = {
    labels: jobPostings.map((job) => job.title),
    datasets: [
        {
            label: 'Applications',
            data: jobPostings.map((job) => job.applications),
            backgroundColor: '#1f3a52', // Dark Green
        },
        {
            label: 'Views',
            data: jobPostings.map((job) => job.views),
            backgroundColor: '#3F7D5D', 
        },
    ],
};

const logIdToken = async () => {
  try {
    const user = getAuth().currentUser; 
    if (!user) {
      console.log('No user is currently signed in.');
      return;
    }

    // Get the Firebase ID token
    const idToken = await user.getIdToken();
    console.log('Firebase ID Token:', idToken); 
  } catch (error) {
    console.error('Error fetching ID token:', error);
  }
};


logIdToken();


  return (
    <main className="dashboard-recruiter-container">
      <NavbarRecruiters />
      <h1 className="dashboard-recruiter-heading">Recruiter Dashboard</h1>

      <div className="dashboard-recruiter-content">
      <aside className="dashboard-recruiter-sidebar">
    <h2>Actions</h2>
    <button onClick={() => navigate('/createpost')} className="recruiter-action-button post-job-button">
        Post a Job
    </button>
    <button onClick={() => navigate('/viewjobpostings')} className="recruiter-action-button view-job-button">
        View Job Postings
    </button>
    <button onClick={() => navigate('/jobseekerchat')} className="recruiter-action-button inbox-button">
        Inbox
    </button>
</aside>



        <section className="dashboard-recruiter-main">
          <h2>Job Postings Overview</h2>

          <div className="recruiter-insights-panel">
            <div className="recruiter-insight-card">Total Job Postings: {totalJobs}</div>
            <div className="recruiter-insight-card">Total Applications: {totalApplications}</div>
            <div className="recruiter-insight-card">Avg. Views per Job: {avgViewsPerJob}</div>
          </div>

          <div className="recruiter-chart-container">
            <h3>Job Postings Stats</h3>
            <Bar data={chartData} />
          </div>
        </section>
      </div>
    </main>
  );
};

export default DashRecruiter;
