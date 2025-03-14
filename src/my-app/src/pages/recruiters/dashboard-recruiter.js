import React from 'react';
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import NavbarRecruiters from './NavbarRecruiters';
import NavbarAdmin from '../admin/navbar-admin';
import { useNavigate } from 'react-router-dom';
import '../../components/style.css';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, scales } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashRecruiter = () => {
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || null);
  const [numJobPostings, setNumJobPostings] = useState(0)
  const [numApplicants, setnumApplicants] = useState(0)
  useEffect(() => {
    const auth = getAuth();
    auth.onAuthStateChanged((user) => {
      if (user) {
        const storedRole = localStorage.getItem('userRole');
        setUserRole(storedRole);

        fetchNumJobPostings(user.uid);
        fetchTotalApplicants(user.uid);
      }
    });
  }, []);

  const navigate = useNavigate();


  const fetchNumJobPostings = async (recruiterId) => {
    try {
      const idToken = await getAuth().currentUser.getIdToken(); 
      const response = await fetch(`http://localhost:5000/numjobpostings?recruiter_id=${recruiterId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': idToken, 
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch number of job postings');
      }

      const data = await response.json();
      setNumJobPostings(data.num_jobpostings); 
    } catch (error) {
      console.error('Error fetching number of job postings:', error);
    }
  };

  const fetchTotalApplicants = async (recruiterId) => {
    try {
      const idToken = await getAuth().currentUser.getIdToken(); 
      const response = await fetch(`http://localhost:5000/numapplicants?recruiter_id=${recruiterId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': idToken, 
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch number of applicants');
      }

      const data = await response.json();
      console.log("Total Applicants:", data.total_applicants);
      setnumApplicants(data.total_applicants); 
    } catch (error) {
      console.error('Error fetching number applicnnta:', error);
    }
  };

  
  const avgViewsPerJob = 7; //placeholder

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Applications',
        data: [],
        backgroundColor: '#1f3a52', // Dark Green
      },
      {
        label: 'Views',
        data: [],
        backgroundColor: '#3F7D5D',
      },
    ],
  });

  const chartOptions = {
    scales: {
      y: {
        min: 0,
        max: 30,
        ticks: {
          stepSize: 1
        }
      }
    }
  }

  useEffect(() => {
    const fetchJobPostings = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
  
      if (!user) {
        console.error('User not authenticated');
        return;
      }
  
      try {
        const idToken = await user.getIdToken();
  
        const response = await fetch('http://localhost:5000/fetch-jobs', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': idToken,
          },
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch job postings');
        }
  
        const jobs = await response.json();
        console.log("Fetched Jobs:", jobs); // Log the fetched data
  
        if (jobs.length === 0) {
          console.log("No job postings found");
          return;
        }
  
        const newChartData = {
          labels: jobs.map((job) => job.Title),
          datasets: [
            {
              label: 'Applications',
              data: jobs.map((job) => job.applicantsnum || 0),
              backgroundColor: '#1f3a52', // Dark Green
            },
            {
              label: 'Views',
              data: jobs.map((job) => job.views || 0),
              backgroundColor: '#3F7D5D',
            },
          ],
        };
  
        console.log("Chart Data:", newChartData); // Log the chart data
        setChartData(newChartData);
      } catch (error) {
        console.error('Error fetching job postings:', error);
      }
    };
  
    fetchJobPostings();
  }, []);

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
    <button onClick={() => navigate('/login')} className="recruiter-action-button post-job-button">
          Logout
    </button>
</aside>



        <section className="dashboard-recruiter-main">
          <h2>Job Postings Overview</h2>

          <div className="recruiter-insights-panel">
            <div className="recruiter-insight-card">Total Job Postings: {numJobPostings}</div>
            <div className="recruiter-insight-card">Total Applications: {numApplicants}</div>
            <div className="recruiter-insight-card">Avg. Views per Job: {avgViewsPerJob}</div>
          </div>

          <div className="recruiter-chart-container">
            <h3>Job Postings Stats</h3>
            <Bar data={chartData} options={chartOptions}/>
          </div>
        </section>
      </div>
    </main>
  );
};

export default DashRecruiter;
