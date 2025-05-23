import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import '../../components/style.css'; 

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const monthOrder = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const mockJobOptions = [
  'Software Engineer', 'Data Analyst', 'Project Manager', 'Product Designer', 'Marketing Specialist'
];

const JobTrackerRecruiter = () => {
  const [jobTrends, setJobTrends] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [applications, setApplications] = useState('');
  const [month, setMonth] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [customTags, setCustomTags] = useState([]);
  const [visibility, setVisibility] = useState('Active');
  const [error, setError] = useState('');

  const handleAddJobTrend = () => {
    if (!selectedJob || !applications || !month) {
      setError("Oops! Looks like you missed something. Please complete all fields.");
      return;
    }
    setError("");

    const newJobTrend = {
      jobTitle: selectedJob,
      applications: parseInt(applications),
      month,
      customNotes,
      customTags,
      visibility,
    };

    setJobTrends([...jobTrends, newJobTrend]);
    setSelectedJob('');
    setApplications('');
    setMonth('');
    setCustomNotes('');
    setCustomTags([]);
    setVisibility('Active');
  };

  const handleTagInput = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      setCustomTags([...customTags, e.target.value.trim()]);
      e.target.value = '';
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const sortedJobTrends = jobTrends.sort(
    (a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
  );

  const lineChartData = {
    labels: [...new Set(sortedJobTrends.map(trend => trend.month))],
    datasets: mockJobOptions.map((job, index) => ({
      label: job,
      data: sortedJobTrends
        .filter(trend => trend.jobTitle === job)
        .map(trend => trend.applications),
      borderColor: ['#192231', '#404a42', '#c0b283', '#eddbcd', '#6a0572'][index % 5], 
      fill: false,
    })),
  };

  return (
    <main>
      <h1 className="job-tracker__title">Job Tracker</h1> 
      <section className="job-tracker__container">
        <div className="job-tracker__card">
          <div className="job-tracker__form">
            <div className="job-options-container">
              {mockJobOptions.map((job, index) => (
                <button 
                  key={index} 
                  className={`job-option-button ${selectedJob === job ? 'selected' : ''}`} 
                  onClick={() => setSelectedJob(job)}
                  style={{ margin: "1%" }} 
                >
                  {job}
                </button>
              ))}
            </div>

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


            <label>Custom Tags (Press Enter to Add)</label>
            <input type="text" placeholder="Add tags..." onKeyDown={handleTagInput} />
            <div className="custom-tags">
              {customTags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
            
            <label>Job Posting Visibility</label>
              <div className="visibility-toggle">
                {["Active", "Paused", "Featured"].map((status) => (
                  <button
                    key={status}
                    className={`visibility-button ${visibility === status ? "selected" : ""}`}
                    onClick={() => setVisibility(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>


            <button onClick={handleAddJobTrend}>Add Job Trend</button>

            {error && <div className="error-message">{error}</div>}
          </div>

          <div className="job-tracker__chart">
            <h2>Line Chart - Job Trends</h2>
            <Line data={lineChartData} /> 
          </div>
        </div>
      </section>
    </main>
  );
};

export default JobTrackerRecruiter;
