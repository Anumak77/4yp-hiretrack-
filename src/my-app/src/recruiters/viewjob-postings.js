import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/style.css';

const ViewJobPostings = () => {
    const navigate = useNavigate();

  const [jobPostings, setJobPostings] = useState([
    { id: 1, title: 'Software Engineer', company: 'Google', location: 'New York', description: 'Develop scalable web applications.' },
    { id: 2, title: 'Product Manager', company: 'Microsoft', location: 'Seattle', description: 'Lead cross-functional teams to deliver product roadmaps.' },
    { id: 3, title: 'Data Scientist', company: 'Amazon', location: 'San Francisco', description: 'Analyze large datasets to generate insights.' }
  ]);

  const handleEdit = (id) => {
    console.log(`Edit job posting with ID: ${id}`);
  };

  const handleViewInsights = (id) => {
    console.log(`View insights for job posting with ID: ${id}`);
  };

  const handleDelete = (id) => {
    setJobPostings(jobPostings.filter(job => job.id !== id));
    console.log(`Deleted job posting with ID: ${id}`);
  };

  return (
    <main className="view-job-container">
      <div className="view-job-header">
        <button type="button" className="back-button-jobposting" onClick={() => navigate('/dashboard-recruiter')}>Go Back</button>
      </div>
      <h1 className="view-job-title">Job Postings</h1>
      <section className="job-list">
        {jobPostings.map((job) => (
          <div key={job.id} className="job-card">
            <button className="delete-button" onClick={() => handleDelete(job.id)}>Delete</button>
            <div className="job-card-header">
              <h2 className="job-card-title">{job.title}</h2>
              <p className="job-card-company">{job.company} - {job.location}</p>
            </div>
            <p className="job-card-description">{job.description}</p>
            <div className="job-card-actions">
              <button className="action-button" onClick={() => handleEdit(job.id)}>Edit</button>
              <button className="action-button" onClick={() => handleViewInsights(job.id)}>View Insights</button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
};

export default ViewJobPostings;