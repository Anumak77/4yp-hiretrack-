import React from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const JobTracker = () => {
  // Mock Data
  const barChartData = {
    labels: ['January', 'February', 'March', 'April', 'May'],
    datasets: [
      {
        label: 'Applications',
        data: [5, 8, 12, 10, 15],
        backgroundColor: '#ff69b4',
      },
    ],
  };

  const pieChartData = {
    labels: ['Applied', 'Interviewed', 'Offers Received', 'Rejected'],
    datasets: [
      {
        data: [4, 3, 2, 1],
        backgroundColor: ['#ff69b4', '#f7aef8', '#b388eb', '#6a0572'],
      },
    ],
  };

  const lineChartData = {
    labels: ['January', 'February', 'March', 'April'],
    datasets: [
      {
        label: 'Job Applications',
        data: [4, 2, 3, 1],
        borderColor: '#ff69b4',
        fill: false,
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
          maxWidth: '900px',
          width: '100%',
        }}
      >
        <h1 style={{ color: '#ff69b4', marginBottom: '20px' }}>Job Tracker Dashboard</h1>

        <div style={{ marginBottom: '40px' }}>
          <h2>Bar Chart - Applications Per Month</h2>
          <Bar data={barChartData} />
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h2>Pie Chart - Job Status</h2>
          <Pie data={pieChartData} />
        </div>

        <div>
          <h2>Line Chart - Job Trends</h2>
          <Line data={lineChartData} />
        </div>
      </section>
    </main>
  );
};

export default JobTracker;
