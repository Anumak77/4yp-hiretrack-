import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
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

const EditJob = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
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

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        const user = getAuth().currentUser;
        if (!user) throw new Error('User not authenticated');

        const idToken = await user.getIdToken();
        if (!idToken) throw new Error('Failed to get ID token');

        const response = await fetch(`http://localhost:5000/fetch-job/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': idToken,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch job data');
        }

        const job = await response.json();
        setJobData(job); 
      } catch (error) {
        console.error('Error fetching job data:', error);
        showAlert(error.message || 'An error occurred while fetching the job data.', 'error');
      }
    };

    fetchJobData();
  }, [id]);

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

    const missingFields = [];

    Object.entries(jobData).forEach(([key, value]) => {
      if (typeof value === "string" && value.trim() === "") {
        missingFields.push(key);
      } else if (value === undefined || value === null) {
        missingFields.push(key);
      }
    });

    if (missingFields.length > 0) {
      showAlert(`Please fill out all fields: ${missingFields.join(", ")}`, 'error');
      return;
    }

    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error('User not authenticated');

      const idToken = await user.getIdToken();
      if (!idToken) throw new Error('Failed to get ID token');

      const response = await axios.put(`http://localhost:5000/update-job/${id}`, jobData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': idToken,
        },
      });

      if (response.data.success) {
        showAlert('Job Updated Successfully!', 'success');
        console.log('Job updated with ID:', response.data.jobId);
        navigate('/dashboard-recruiter');
      } else {
        throw new Error(response.data.error || "Failed to update job");
      }
    } catch (error) {
      console.error('Error updating job:', error);
      showAlert(error.message || 'An error occurred while updating the job.', 'error');
    }
  };

  return (
    <main>
      <h1 className="post-job-title">Edit Job</h1>
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

            <button type="submit" className="post-job-button">Update Job</button>
          </form>
        </section>
      </section>
    </main>
  );
};

export default EditJob;