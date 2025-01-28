import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import '../components/style.css'; 

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
      borderColor: ['#192231', '#404a42', '#c0b283', '#eddbcd', '#6a0572'][index % 5], 
      fill: false,
    })),
  };

  return (
    <main className="job-tracker__container">
      <section className="job-tracker__card">
        <h1 className="job-tracker__title">Job Tracker</h1>

        <div className="job-tracker__form">
          <label>Select Job Title</label>
          <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)}>
            <option value="">Select a Job</option>
            {jobOptions.map((job, index) => (
              <option key={index} value={job}>{job}</option>
            ))}
          </select>

          <label>Application Date</label>
          <input
            type="text"
            placeholder="Enter Month (e.g., January)"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />

          <input
            type="number"
            placeholder="Applications Count"
            value={applications}
            onChange={(e) => setApplications(e.target.value)}
          />

          <button onClick={handleAddJobTrend}>Add Job Trend</button>
        </div>

        <div className="job-tracker__chart">
          <h2>Line Chart - Job Trends</h2>
          <Line data={lineChartData} />
        </div>
      </section>
    </main>
  );
};

export default JobTrackerRecruiter;
