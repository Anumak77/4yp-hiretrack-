import React, { useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const jobOptions = [
  'Software Engineer',
  'Data Analyst',
  'Project Manager',
  'Product Designer',
  'Marketing Specialist',
];

const JobTrackerJobseeker = () => {
  const [selectedJob, setSelectedJob] = useState('');
  const [jobApplications, setJobApplications] = useState([]);
  const [dueDate, setDueDate] = useState('');
  const [jobStatus, setJobStatus] = useState('Applied');

  const handleAddApplication = () => {
    if (!selectedJob || !dueDate) {
      alert('Please select a job and enter a due date.');
      return;
    }

    const newApplication = {
      jobTitle: selectedJob,
      dueDate,
      status: jobStatus,
    };

    setJobApplications([...jobApplications, newApplication]);
    setSelectedJob('');
    setDueDate('');
  };

  const handleStatusChange = (status) => {
    setJobStatus(status);
  };

  const barChartData = {
    labels: jobApplications.map(app => app.jobTitle),
    datasets: [
      {
        label: 'Applications',
        data: jobApplications.map(() => 1), // Each application counts as 1
        backgroundColor: '#ff69b4',
      },
    ],
  };

  const pieChartData = {
    labels: ['Applied', 'Interviewed', 'Rejected'],
    datasets: [
      {
        data: [
          jobApplications.filter(app => app.status === 'Applied').length,
          jobApplications.filter(app => app.status === 'Interviewed').length,
          jobApplications.filter(app => app.status === 'Rejected').length,
        ],
        backgroundColor: ['#ff69b4', '#f7aef8', '#6a0572'],
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

        <div style={{ marginBottom: '20px' }}>
          <h2>Add New Application</h2>
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            style={{ padding: '10px', marginBottom: '10px', width: '100%' }}
          >
            <option value="">Select a Job</option>
            {jobOptions.map((job, index) => (
              <option key={index} value={job}>{job}</option>
            ))}
          </select>

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={{ padding: '10px', width: '100%', marginBottom: '10px' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <button
              onClick={() => handleStatusChange('Applied')}
              style={{
                padding: '10px 20px',
                backgroundColor: jobStatus === 'Applied' ? '#ff69b4' : '#ddd',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Applied
            </button>
            <button
              onClick={() => handleStatusChange('Interviewed')}
              style={{
                padding: '10px 20px',
                backgroundColor: jobStatus === 'Interviewed' ? '#f7aef8' : '#ddd',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Interviewed
            </button>
            <button
              onClick={() => handleStatusChange('Rejected')}
              style={{
                padding: '10px 20px',
                backgroundColor: jobStatus === 'Rejected' ? '#6a0572' : '#ddd',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Rejected
            </button>
          </div>

          <button
            onClick={handleAddApplication}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Add Application
          </button>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h2>Bar Chart - Applications Per Job</h2>
          <Bar data={barChartData} />
        </div>

        <div style={{ marginBottom: '40px' }}>
          <h2>Pie Chart - Job Status</h2>
          <Pie data={pieChartData} />
        </div>
      </section>
    </main>
  );
};

export default JobTrackerJobseeker;

