import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../components/style.css';
import { createJobPosting, updateJobPosting } from "../components/utils";


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
  const location = useLocation();
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
    jobpost: '',
    applicants: []
  });


  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    if (location.state?.job) {
      setJobData(location.state.job);
      setIsEditing(true);
    }
  }, [location.state]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { date, jobpost, ...cleanedJobData } = jobData;
    
    const isFormValid = Object.values(cleanedJobData).every(([key, value]) => {
      if (typeof value === "string") {
        return value.trim() !== ""; 
      }
      return value !== undefined && value !== null; 
    });
    
    if (!isFormValid) {
      console.log("Missing fields:", jobData);
      showAlert('Please fill out all fields.', 'error');
      return;
    }

    let result;
  if (isEditing) {
    
    result = await updateJobPosting(jobData);  
  } else {
    
    result = await createJobPosting(jobData);
  }
    
    if (result.success) {
      showAlert("Job Posted Successfully!", "success");
      navigate("/dashboard-recruiter");
    } else {
      showAlert("Error posting job. Try again.", "error");
    }
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
            <label>About Company</label>
            <textarea name="AboutC" value={jobData.AboutC} onChange={handleChange} placeholder="Enter information about the company" required></textarea>
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
              <label>OpeningDate</label>
              <input type="date" name="OpeningDate" value={jobData.OpeningDate} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Deadline</label>
              <input type="date" name="Deadline" value={jobData.Deadline} onChange={handleChange} required />
            </div>
          </div>
          <div className="input-group">
              <label>Start Date</label>
              <input type="date" name="StartDate" value={jobData.StartDate} onChange={handleChange} required />
            </div>

          <button type="submit" className="post-job-button">Post Job</button>
        </form>
      </section>
    </main>
  );
};

export default PostJob;
