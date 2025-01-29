import React, { useState } from 'react';
import '../components/style.css';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashRecruiter = () => {
  // Mock data for job postings
  const jobPostings = [
    { id: 1, title: 'Software Engineer', views: 150, applications: 25 },
    { id: 2, title: 'Product Manager', views: 90, applications: 10 },
    { id: 3, title: 'Data Analyst', views: 120, applications: 18 },
  ];

  // Mock insights
  const totalJobs = jobPostings.length;
  const totalApplications = jobPostings.reduce((acc, job) => acc + job.applications, 0);
  const avgViewsPerJob = (jobPostings.reduce((acc, job) => acc + job.views, 0) / totalJobs).toFixed(2);

  // Bar Chart Data
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
        {/* Sidebar */}
        <aside className="dashboard-sidebar" style={{ backgroundColor: '#c0b283', padding: '20px', borderRadius: '8px', flex: '1', color: '#404a42' }}>
          <h2>Actions</h2>
          <button style={{ width: '100%', padding: '10px', backgroundColor: '#404a42', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px', color: '#c0b283' }}>Post a Job</button>
          <button style={{ width: '100%', padding: '10px', backgroundColor: '#404a42', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px', color: '#c0b283' }}>View Applications</button>
          <button style={{ width: '100%', padding: '10px', backgroundColor: '#404a42', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px', color: '#c0b283' }}>Profile</button>
          <button style={{ width: '100%', padding: '10px', backgroundColor: '#404a42', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px', color: '#c0b283' }}>Interview Scheduler</button>
          <button style={{ width: '100%', padding: '10px', backgroundColor: '#404a42', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px', color: '#c0b283' }}>Manage Job Listings</button>
        </aside>

        {/* Main Section */}
        <section className="dashboard-main" style={{ flex: '3', backgroundColor: '#f4f4f4', padding: '20px', borderRadius: '8px' }}>
          <h2>Job Postings Overview</h2>
          <div className="insights-panel" style={{ display: 'flex', justifyContent: 'space-around', margin: '20px 0' }}>
            <div className="insight-card" style={{ backgroundColor: '#c0b283', padding: '15px', margin: '10px', borderRadius: '8px' }}>Total Job Postings: {totalJobs}</div>
            <div className="insight-card" style={{ backgroundColor: '#c0b283', padding: '15px', margin: '10px',borderRadius: '8px' }}>Total Applications: {totalApplications}</div>
            <div className="insight-card" style={{ backgroundColor: '#c0b283', padding: '15px', margin: '10px',borderRadius: '8px' }}>Avg. Views per Job: {avgViewsPerJob}</div>
          </div>

          {/* Chart */}
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

