import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const jobOptions = [
  'Software Engineer',
  'Data Analyst',
  'Project Manager',
  'Product Designer',
  'Marketing Specialist',
];

const monthOrder = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const JobTrackerRecruiter = () => {
  const [jobTrends, setJobTrends] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [applications, setApplications] = useState('');
  const [month, setMonth] = useState('');

  const handleAddJobTrend = () => {
    if (!selectedJob || !applications || !month) {
      alert('Please fill out all fields.');
      return;
    }

    const newJobTrend = {
      jobTitle: selectedJob,
      applications: parseInt(applications),
      month,
    };

    setJobTrends([...jobTrends, newJobTrend]);
    setSelectedJob('');
    setApplications('');
    setMonth('');
  };

  const sortedJobTrends = jobTrends.sort(
    (a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
  );

  const lineChartData = {
    labels: [...new Set(sortedJobTrends.map(trend => trend.month))],
    datasets: jobOptions.map((job, index) => ({
      label: job,
      data: sortedJobTrends
        .filter(trend => trend.jobTitle === job)
        .map(trend => trend.applications),
      borderColor: ['#ff69b4', '#f7aef8', '#6a0572', '#007bff', '#34ebc0'][index % 5],
      fill: false,
    })),
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
          <h2>Add New Job Trend</h2>

          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Select Job Title</label>
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            style={{ padding: '10px', width: '100%', marginBottom: '10px' }}
          >
            <option value="">Select a Job</option>
            {jobOptions.map((job, index) => (
              <option key={index} value={job}>
                {job}
              </option>
            ))}
          </select>

          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Application Date</label>
          <input
            type="text"
            placeholder="Enter Month (e.g., January)"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{ padding: '10px', width: '100%', marginBottom: '10px' }}
          />

          <input
            type="number"
            placeholder="Applications Count"
            value={applications}
            onChange={(e) => setApplications(e.target.value)}
            style={{ padding: '10px', width: '100%', marginBottom: '10px' }}
          />

          <button
            onClick={handleAddJobTrend}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Add Job Trend
          </button>
        </div>


        <div>
          <h2>Line Chart - Job Trends</h2>
          <Line data={lineChartData} />
        </div>
      </section>
    </main>
  );
};

export default JobTrackerRecruiter;
