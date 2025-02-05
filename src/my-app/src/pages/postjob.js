import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/style.css';

const PostJob = () => {
  const navigate = useNavigate();
  const [jobData, setJobData] = useState({
    AboutC: '',
    ApplicationP: '',
    Company: '',
    Deadline: '',
    JobDescription: '',
    JobRequirment: '',
    Location: '',
    OpeningDate: '',
    RequiredQual: '',
    StartDate: '',
    Title: '',
    date: '',
    jobpost: ''
  });
  
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('error');

  const showAlert = (message, type = 'error') => {
    setAlertMessage(message);
    setAlertType(type);
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleChange = (e) => {
    setJobData({ ...jobData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const isFormValid = Object.values(jobData).every(value => value !== undefined && value !== null && value.trim() !== '');
    
    if (!isFormValid) {
      showAlert('Please fill out all fields.', 'error');
      return;
    }
    
    console.log('Job Data Submitted:', jobData);
    showAlert('Job Posted Successfully!', 'success');
  };

  return (
    <main className="post-job-container">
      <section className="post-job-card">
        {alertMessage && <div className={`alert-box ${alertType}`}>{alertMessage}</div>}
        <button type="button" className="back-button" onClick={() => navigate('/dashboard-recruiter')}>Go Back</button>
        <h1 className="post-job-title">Post a Job</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Job Title</label>
            <input type="text" name="Title" value={jobData.Title} onChange={handleChange} placeholder="Enter job title" required />
          </div>

          <div className="input-group">
            <label>Company</label>
            <input type="text" name="Company" value={jobData.Company} onChange={handleChange} placeholder="Enter company name" required />
          </div>

          <div className="input-group">
            <label>Location</label>
            <input type="text" name="Location" value={jobData.Location} onChange={handleChange} placeholder="Enter job location" required />
          </div>

          <div className="input-group">
            <label>Job Description</label>
            <textarea name="JobDescription" value={jobData.JobDescription} onChange={handleChange} placeholder="Enter job description" required></textarea>
          </div>

          <div className="input-group">
            <label>Job Requirements</label>
            <input type="text" name="JobRequirment" value={jobData.JobRequirment} onChange={handleChange} placeholder="Enter job requirements" required />
          </div>

          <div className="input-group">
            <label>Required Qualifications</label>
            <input type="text" name="RequiredQual" value={jobData.RequiredQual} onChange={handleChange} placeholder="Enter required qualifications" required />
          </div>

          <div className="input-group">
            <label>Application Process</label>
            <input type="text" name="ApplicationP" value={jobData.ApplicationP} onChange={handleChange} placeholder="Enter application process" required />
          </div>

          <div className="date-container">
            <div className="input-group">
              <label>Starting Date</label>
              <input type="date" name="OpeningDate" value={jobData.OpeningDate} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Deadline</label>
              <input type="date" name="Deadline" value={jobData.Deadline} onChange={handleChange} required />
            </div>
          </div>

          <button type="submit" className="post-job-button">Post Job</button>
        </form>
      </section>
    </main>
  );
};

export default PostJob;