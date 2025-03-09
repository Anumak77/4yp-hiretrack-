import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../components/style.css';

const EditJob = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 

  // fake job data (Just placeholders)
  const fakeJob = {
    title: "Test Job Title",
    company: "Test Company",
    location: "Test Location",
    description: "This is a test description for the job.",
  };

  const [jobData, setJobData] = useState(fakeJob);

  const handleChange = (e) => {
    setJobData({ ...jobData, [e.target.name]: e.target.value });
  };

  // (No backend, just logs the updated data)
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated Job Data:", jobData);
    alert("Job updated successfully! (Mock Data)");
    navigate('/viewjobpostings'); // Redirect back
  };

  return (
    <main>
      <h1 className="post-job-title">Edit Job</h1>
      <section className="post-job-container">
        <section className="post-job-card">
          <button type="button" className="back-button" onClick={() => navigate('/viewjobpostings')}>
            Go Back
          </button>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Job Title</label>
              <input type="text" name="title" value={jobData.title} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label>Company</label>
              <input type="text" name="company" value={jobData.company} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label>Location</label>
              <input type="text" name="location" value={jobData.location} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label>Job Description</label>
              <textarea name="description" value={jobData.description} onChange={handleChange} required></textarea>
            </div>

            <button type="submit" className="post-job-button">Update Job</button>
          </form>
        </section>
      </section>
    </main>
  );
};

export default EditJob;
