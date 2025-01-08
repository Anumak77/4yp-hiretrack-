import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { jobApplications, jobTitles, jobTrends } from '../mockData.js'; 

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const jobData = {
    labels: jobApplications.map((job) => job.status),
    datasets: [
      {
        label: 'Job Applications Status',
        data: jobApplications.map((job) => job.count),
        backgroundColor: ['#ff69b4', '#ffb6c1', '#ff1493', '#ff85a1'],
        borderColor: '#ff69b4',
        borderWidth: 1,
      },
    ],
  };

  const titleData = {
    labels: jobTitles.map((job) => job.title),
    datasets: [
      {
        label: 'Job Titles Applied For',
        data: jobTitles.map((job) => job.count),
        backgroundColor: ['#ff69b4', '#ffb6c1', '#ff1493', '#ff85a1'],
        borderColor: '#ff69b4',
        borderWidth: 1,
      },
    ],
  };

  const trendData = {
    labels: jobTrends.map((trend) => trend.month),
    datasets: [
      {
        label: 'Job Applications Over Time',
        data: jobTrends.map((trend) => trend.applications),
        fill: false,
        borderColor: '#ff69b4',
        tension: 0.1,
      },
    ],
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8c8dc',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        padding: '20px',
      }}
    >
      <section
        style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0px 6px 16px rgba(200, 120, 140, 0.3)',
          textAlign: 'center',
          maxWidth: '800px',
          width: '100%',
          marginBottom: '20px',
        }}
      >

        <div style={{ marginBottom: '20px' }}>
          <h2>Job Applications Status</h2>
          <Bar data={jobData} />
        </div>

        <div style={{ marginBottom: '80px' }}>
        <div style={{ width: '600px', height: '600px', margin: '0 auto' }}>
          <h2>Job Titles Applied For</h2>
          <Pie data={titleData} />
        </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2>Job Applications Over Time</h2>
          <Line data={trendData} />
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
