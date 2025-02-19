import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../components/style.css';

const countryOptions = [
  "United States",
  "United Kingdom",
  "India",
  "Canada",
  "Germany",
  "France",
  "Australia",
  "Armenia",
  "Singapore",
  "United Arab Emirates"
];

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
    
    const missingFields = [];

    Object.entries(cleanedJobData).forEach(([key, value]) => {
      if (typeof value === "string" && value.trim() === "") {
        missingFields.push(key);
      } else if (value === undefined || value === null) {
        missingFields.push(key);
      }
    });
    
    if (missingFields.length > 0) {
      console.log("Missing fields:", missingFields);
      console.log("Form Data:", cleanedJobData);
      showAlert(`Please fill out all fields: ${missingFields.join(", ")}`, 'error');

      return;
    }
    
    console.log('Job Data Submitted:', jobData);
    showAlert('Job Posted Successfully!', 'success');
  };

  return (
    <main>
              <h1 className="post-job-title">Post a Job</h1>

      <section className="post-job-container">
      <section className="post-job-card">
        {alertMessage && <div className={`alert-box ${alertType}`}>{alertMessage}</div>}
        <button type="button" className="back-button" onClick={() => navigate('/dashboard-recruiter')}>Go Back</button>
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
  <label htmlFor="Location">Location</label>
  <select
    name="Location"
    value={jobData.Location}
    onChange={handleChange}
    required
    className="location-dropdown"
  >
    <option value="">Select a country</option>
    {countryOptions.map((country, index) => (
      <option key={index} value={country}>{country}</option>
    ))}
  </select>
</div>


          <div className="input-group">
            <label>Job Description</label>
            <textarea name="JobDescription" value={jobData.JobDescription} onChange={handleChange} placeholder="Enter job description" required></textarea>
          </div>

          <div className="input-group">
            <label>Job Requirements</label>
            <textarea name="JobRequirment" value={jobData.JobRequirment} onChange={handleChange} placeholder="Enter job requirements" required></textarea>
          </div>

          <div className="input-group">
            <label>Required Qualifications</label>
            <textarea name="RequiredQual" value={jobData.RequiredQual} onChange={handleChange} placeholder="Enter required qualifications" required></textarea>
          </div>

          <div className="input-group">
            <label>Application Process</label>
            <textarea name="ApplicationP" value={jobData.ApplicationP} onChange={handleChange} placeholder="Enter application process" required></textarea>
          </div>

          <div className="date-container">
            <div className="input-group">
              <label>Opening Date</label>
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
      </section>
    </main>
  );
};

export default PostJob;
