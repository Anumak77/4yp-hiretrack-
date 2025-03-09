import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {getAuth} from 'firebase/auth'
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
    setShowConfirmation(true);
  };

  const confirmSubmission = async () => {
    setShowConfirmation(false);
    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error("User not authenticated");
  
      const db = getFirestore();
      const newJob = {
        AboutC: jobData.AboutC,
        ApplicationP: jobData.ApplicationP,
        Company: jobData.Company,
        Deadline: jobData.Deadline,
        JobDescription: jobData.JobDescription,
        JobRequirment: jobData.JobRequirment,
        Location: jobData.Location,
        OpeningDate: jobData.OpeningDate,
        RequiredQual: jobData.RequiredQual,
        StartDate: jobData.StartDate,
        Title: jobData.Title,
        date: new Date().toISOString(),
        jobpost: user.uid, 
      };
  
      console.log("Posting job data to Firestore:", newJob);
  
      // adds job posting directly to Firestore
      await addDoc(collection(db, "jobposting"), newJob);
  
      showAlert("Job Posted Successfully!", "success");
      navigate("/dashboard-recruiter");
    } catch (error) {
      console.error("Error posting job:", error.message);
      showAlert(error.message || "An error occurred while posting the job.", "error");
    }
  };


  return (
    <main>
      <h1 className='post-job-title'>Post a Job</h1>

      <section className='post-job-container'>
        <section className='post-job-card'>
          {alertMessage && <div className={`alert-box ${alertType}`}>{alertMessage}</div>}

          <button
            type='button'
            className='back-button'
            onClick={() => navigate('/dashboard-recruiter')}
          >
            Go Back
          </button>

          <form onSubmit={handleSubmit}>
            <div className='input-group'>
              <label>Job Title</label>
              <input
                type='text'
                name='Title'
                value={jobData.Title}
                onChange={handleChange}
                placeholder='Enter job title'
                required
              />
            </div>

            <div className='input-group'>
              <label>Company</label>
              <input
                type='text'
                name='Company'
                value={jobData.Company}
                onChange={handleChange}
                placeholder='Enter company name'
                required
              />
            </div>

            <div className='input-group'>
              <label htmlFor='Location'>Location</label>
              <select
                name='Location'
                value={jobData.Location}
                onChange={handleChange}
                required
                className='location-dropdown'
              >
                <option value=''>Select a country</option>
                {countryOptions.map((country, index) => (
                  <option key={index} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div className='input-group'>
              <label>Job Description</label>
              <textarea
                name='JobDescription'
                value={jobData.JobDescription}
                onChange={handleChange}
                placeholder='Enter job description'
                required
              />
            </div>

            <div className='input-group'>
              <label>Job Requirements</label>
              <textarea
                name='JobRequirment'
                value={jobData.JobRequirment}
                onChange={handleChange}
                placeholder='Enter job requirements'
                required
              />
            </div>

            <div className='input-group'>
              <label>Required Qualifications</label>
              <textarea
                name='RequiredQual'
                value={jobData.RequiredQual}
                onChange={handleChange}
                placeholder='Enter required qualifications'
                required
              />
            </div>

            <div className='input-group'>
              <label>Application Process</label>
              <textarea
                name='ApplicationP'
                value={jobData.ApplicationP}
                onChange={handleChange}
                placeholder='Enter application process'
                required
              />
            </div>

            <div className='date-container'>
              <div className='input-group'>
                <label>Opening Date</label>
                <input
                  type='date'
                  name='OpeningDate'
                  value={jobData.OpeningDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className='input-group'>
                <label>Deadline</label>
                <input
                  type='date'
                  name='Deadline'
                  value={jobData.Deadline}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>


            <button type='submit' className='post-job-button'>
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
    </main>
  );
};

export default PostJob;
