import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/style.css';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { fetchJobsPosting } from '../components/utils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashRecruiter = () => {
  const navigate = useNavigate();
  const [jobPostings, setJobPostings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobs = await fetchJobsPosting("jobposting"); // Fetch jobs from Firestore
        setJobPostings(jobs);
      } catch (error) {
        console.error("Error fetching job postings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const totalJobs = jobPostings.length;
  const totalApplications = jobPostings.reduce((acc, job) => acc + job.applications, 0);
  const avgViewsPerJob = (jobPostings.reduce((acc, job) => acc + job.views, 0) / totalJobs).toFixed(2);

  const chartData = {
    labels: jobPostings.map((job) => job.title),
    datasets: [
      {
        label: 'Applications',
        data: jobPostings.map((job) => job.applications),
        backgroundColor: '#c0b283',
      },
      {
        label: 'Views',
        data: jobPostings.map((job) => job.views),
        backgroundColor: '#404a42',
      },
    ],
  };

  return (
    <main className="dashboard-container" style={{ backgroundColor: '#eddbcd', color: '#192231', padding: '20px' }}>
        <h1>Recruiter Dashboard</h1>

      <div className="dashboard-content" style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <aside className="dashboard-sidebar" style={{ backgroundColor: '#c0b283', padding: '20px', borderRadius: '8px', flex: '1', color: '#404a42' }}>
          <h2>Actions</h2>
          <button onClick={() => navigate('/createpost')} style={{ width: '100%', padding: '10px', backgroundColor: '#404a42', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px', color: '#c0b283' }}>Post a Job</button>
          <button onClick={() => navigate('/viewjobpostings')} style={{ width: '100%', padding: '10px', backgroundColor: '#404a42', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px', color: '#c0b283' }}>View Job postings</button>
          <button onClick={() => navigate('/jobseekerchat')} style={{ width: '100%', padding: '10px', backgroundColor: '#404a42', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px', color: '#c0b283' }}>Inbox</button>
        </aside>

        <section className="dashboard-main" style={{ flex: '3', backgroundColor: '#f4f4f4', padding: '20px', borderRadius: '8px' }}>
          <h2>Job Postings Overview</h2>
          <div className="insights-panel" style={{ display: 'flex', justifyContent: 'space-around', margin: '20px 0' }}>
            <div className="insight-card" style={{ backgroundColor: '#c0b283', padding: '15px', margin: '10px', borderRadius: '8px' }}>Total Job Postings: {totalJobs}</div>
            <div className="insight-card" style={{ backgroundColor: '#c0b283', padding: '15px', margin: '10px',borderRadius: '8px' }}>Total Applications: {totalApplications}</div>
            <div className="insight-card" style={{ backgroundColor: '#c0b283', padding: '15px', margin: '10px',borderRadius: '8px' }}>Avg. Views per Job: {avgViewsPerJob}</div>
          </div>

          <div className="chart-container" style={{ padding: '20px', backgroundColor: '#eddbcd', borderRadius: '8px' }}>
            <h3>Job Postings Stats</h3>
            <Bar data={chartData} />
          </div>
        </section>
      </div>
    </main>
  );
};

export default DashRecruiter;