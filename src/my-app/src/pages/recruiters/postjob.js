import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import '../../components/style.css';
import { getFirestore, collection, addDoc } from "firebase/firestore";

const countryOptions = [
  'United States',
  'United Kingdom',
  'India',
  'Canada',
  'Germany',
  'France',
  'Australia',
  'Armenia',
  'Singapore',
  'United Arab Emirates'
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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const showAlert = (message, type = 'error') => {
    setAlertMessage(message);
    setAlertType(type);
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setJobData(prevData => {
      const newData = { ...prevData, [name]: value };
      
      if (name === "JobDescription") {
        newData.jobpost = value;
      }
      
      if (name === "Deadline") {
        newData.OpeningDate = value;
      }
      
      if (name === "StartDate") {
        newData.date = value;
      }
      
      return newData; 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const confirmSubmission = async (e) => {
    e.preventDefault();
  
    const missingFields = [];
    for (const [key, value] of Object.entries(jobData)) {
      if (typeof value === "string" && value.trim() === "") {
        missingFields.push(key);
      } else if (value === undefined || value === null) {
        missingFields.push(key);
      }
    }
  
    if (missingFields.length > 0) {
      showAlert(`Please fill out all fields: ${missingFields.join(", ")}`, 'error');
      return;
    }
  
    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error('User not authenticated');
  
      const idToken = await user.getIdToken();
      const response = await fetch('http://localhost:5000/create-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': idToken,
        },
        body: JSON.stringify(jobData),
      });
  
      if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
  
      const data = await response.json();
  
      if (data.success) {
        setShowConfirmation(false); 
        setShowSuccessModal(true); 
      } else {
        throw new Error(data.error || "Failed to post job");
      }
    } catch (error) { 
      console.error('Error posting job:', error);
      showAlert(error.message || 'An error occurred while posting the job.', 'error');
    }
  };

  return (
    <main>
    <h1 className="post-job-title">Post a Job</h1>

      <section className="post-job-container">
        <section className="post-job-card">
          {alertMessage && <div className={`alert-box ${alertType}`}>{alertMessage}</div>}

          <button
            type="button"
            className="back-button"
            onClick={() => navigate('/dashboard-recruiter')}
          >
            Go Back
          </button>

          <form onSubmit={handleSubmit}>
            {/* Job Title */}
            <div className="input-group">
              <label>Job Title</label>
              <input
                type="text"
                name="Title"
                value={jobData.Title}
                onChange={handleChange}
                placeholder="Enter job title"
                required
              />
            </div>

            {/* Company */}
            <div className="input-group">
              <label>Company</label>
              <input
                type="text"
                name="Company"
                value={jobData.Company}
                onChange={handleChange}
                placeholder="Enter company name"
                required
              />
            </div>

            {/* About Company */}
            <div className="input-group">
              <label>About Company</label>
              <textarea
                name="AboutC"
                value={jobData.AboutC}
                onChange={handleChange}
                placeholder="Enter details about the company"
                required
              />
            </div>

            {/* Location */}
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
                  <option key={index} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Description */}
            <div className="input-group">
              <label>Job Description</label>
              <textarea
                name="JobDescription"
                value={jobData.JobDescription}
                onChange={handleChange}
                placeholder="Enter job description"
                required
              />
            </div>

            {/* Job Requirements */}
            <div className="input-group">
              <label>Job Requirements</label>
              <textarea
                name="JobRequirment"
                value={jobData.JobRequirment}
                onChange={handleChange}
                placeholder="Enter job requirements"
                required
              />
            </div>

            {/* Required Qualifications */}
            <div className="input-group">
              <label>Required Qualifications</label>
              <textarea
                name="RequiredQual"
                value={jobData.RequiredQual}
                onChange={handleChange}
                placeholder="Enter required qualifications"
                required
              />
            </div>

            {/* Application Process */}
            <div className="input-group">
              <label>Application Process</label>
              <textarea
                name="ApplicationP"
                value={jobData.ApplicationP}
                onChange={handleChange}
                placeholder="Enter application process"
                required
              />
            </div>

            {/* Date fields (OpeningDate, Deadline, StartDate, date) */}
            <div className="date-container">

              <div className="input-group">
                <label>Deadline</label>
                <input
                  type="date"
                  name="Deadline"
                  value={jobData.Deadline}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="StartDate"
                  value={jobData.StartDate}
                  onChange={handleChange}
                />
              </div>

            </div>

            <button type="submit" className="post-job-button">
              Post Job
            </button>
          </form>
        </section>
      </section>

      {showConfirmation && (
        <div className='confirmation-modal'>
          <div className='confirmation-content'>
            <h2>Confirm Job Posting</h2>
            <p>Are you sure you want to submit this job?</p>
            <div className='confirmation-buttons'>
              <button className='confirm-button' onClick={confirmSubmission}>Confirm</button>
              <button className='cancel-button' onClick={() => setShowConfirmation(false)}>Cancel</button>
            </div>
          </div>
        </div>
        )}
            {showSuccessModal && (
      <div className="confirmation-modal">
        <div className="confirmation-content">
          <h2>Job Posted Successfully!</h2>
          <p>Your job has been submitted.</p>
          <div className="confirmation-buttons">
            <button 
              className="postjob-afterposted" 
              onClick={() => navigate('/dashboard-recruiter')}
            >
              OK
            </button>
          </div>
        </div>
      </div>
            )}
    </main>
  );
};

export default PostJob;
