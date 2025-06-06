import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
    jobpost: '',
    weights: {
      semantic: 0.5,
      tfidf: 0.3,
      keywords: 0.1,
      experience: 0.1,
    },
  });

  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('error');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        console.log("Editing job ID:", id);

        const user = getAuth().currentUser;
        if (!user) throw new Error('User not authenticated');

        const idToken = await user.getIdToken();
        if (!idToken) throw new Error('Failed to get ID token');

        const user_id = user.uid; // Get the current user's ID
        const response = await fetch(`http://localhost:5000/fetch_job/${user_id}/${id}`, {
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
        setJobData(job); // Pre-fill the form with the fetched job data
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
    const { name, value } = e.target;

    if (name in jobData.weights) {
      setJobData({
        ...jobData,
        weights: { ...jobData.weights, [name]: parseFloat(value) },
      });
    } else {
      setJobData({ ...jobData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error('User not authenticated');

      const idToken = await user.getIdToken();
      const user_id = user.uid;
      const response = await fetch(`http://localhost:5000/update_job/${user_id}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': idToken,
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) throw new Error('Failed to update job');

      setShowSuccessModal(true);
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

            <div className="weights-container">
              <h3>Matching Weights (Optional)</h3>
              <div className="input-group">
                <label>Semantic Similarity Weight</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  name="semantic"
                  value={jobData.weights.semantic}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label>TF-IDF Similarity Weight</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  name="tfidf"
                  value={jobData.weights.tfidf}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label>Keyword Overlap Weight</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  name="keywords"
                  value={jobData.weights.keywords}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label>Experience Match Weight</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  name="experience"
                  value={jobData.weights.experience}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit" className="post-job-button">Update Job</button>
          </form>
        </section>
      </section>
      {showSuccessModal && (
        <div className="confirmation-modal">
          <div className="confirmation-content">
            <h2>Job Updated Successfully!</h2>
            <p>Your changes have been saved.</p>
            <div className="confirmation-buttons">
              <button
                className="confirm-button"
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

export default EditJob;
