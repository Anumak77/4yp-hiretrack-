import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth, firestore, realtimeDb } from '../../components/firebaseconfigs.js';
import '../../components/style.css';

const JobDetails2 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const job = location.state;
  const [showPopup, setShowPopup] = useState(false);
  const [matchScore, setMatchScore] = useState(null);
  const[base64Data, setBase64Data] = useState(null);

  const closePopup = () => {
    setShowPopup(false);
  };

  if (!job) {
    return <p className="job-details__no-job">No job details available.</p>;
  }

  const fetchPdfFromFlaskBackend = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
  
      const idToken = await user.getIdToken();
      if (!idToken) throw new Error('Failed to get ID token');
  
      console.log('Fetching CV from Flask backend...');
      const response = await fetch('http://localhost:5000/fetch-pdf', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': idToken,
        },
      });
  
      console.log('Response Status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch CV');
      }
  
      const result = await response.json();
      console.log('CV Data from Backend:', result.fileData);
  
      if (result.fileData) {
        return result.fileData;
      } else {
        throw new Error(result.error || 'No CV found for user');
      }
    } catch (error) {
      console.error('Error fetching CV:', error);
      throw error;
    }
  };
  const compareWithDescription = async () => {
    try {
      let cvBase64 = base64Data || await fetchPdfFromFlaskBackend();
  
      if (!cvBase64) {
        alert('No CV found for the user. Please upload a CV.');
        return;
      }
  
      cvBase64 = cvBase64.trim();
  
      const cv = cvBase64.startsWith('data:') ? cvBase64.split(',')[1] : cvBase64;
  
      const payload = {
        JobDescription: job.JobDescription,
        JobRequirment: job.JobRequirment,
        RequiredQual: job.RequiredQual,
        cv: cv
      };
  
      const response = await fetch('http://127.0.0.1:5000/compare_with_description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
  
      if (!response.ok) {
        throw new Error('Failed to get match score from backend');
      }
  
      const data = await response.json();
      const similarityScore = data.matchscore;
      const matchScorePercentage = (similarityScore * 100).toFixed(2);
  
      setMatchScore(matchScorePercentage);
      setShowPopup(true);
    } catch (error) {
      console.error('Error comparing CV with job description:', error);
      alert('An error occurred. Please try again.');
    }
  };
  


  return (
    <main className="job-details__container">
      <section className="job-details__card">
        <div className="job-details__header">
          <button className="job-details__button" onClick={() => navigate(-1)}>Go Back</button>
        </div>

        <h1 className="job-details__title">Job Details</h1>

        <p><strong>Job Title:</strong> {job['Title'] || "N/A"}</p>
        <p><strong>Company:</strong> {job['Company'] || "N/A"}</p>
        <p><strong>Location:</strong> {job['Location'] || "N/A"}</p>
        <p><strong>Job Description:</strong> {job['JobDescription'] || "N/A"}</p>

        <p><strong>Job Requirements:</strong></p>
        <ul>
          {job['JobRequirment']?.split(';').map((req, index) => (
            <li key={index}>{req.trim()}</li>
          ))}
        </ul>

        <p><strong>Required Qualifications:</strong></p>
        <ul>
          {job['RequiredQual']?.split(';').map((qual, index) => (
            <li key={index}>{qual.trim()}</li>
          ))}
        </ul>

        <p><strong>Start Date:</strong> {job['OpeningDate'] || "N/A"}</p>
        <p><strong>Application Deadline:</strong> {job['Deadline'] || "N/A"}</p>

        <div className="job-details__actions">
          <button className="job-details__button" onClick={compareWithDescription}>Get Match Score</button>
        </div>
      </section>



{showPopup && (
  <div className="popup-overlay">
    <div className="popup-content">
      {matchScore !== null ? (
        <p>Your match score with this job is: {matchScore}%</p>
      ) : (
        <p>You have successfully applied for this job.</p>
      )}
      <button className="popup-cancel-button" onClick={closePopup}>Cancel</button>
    </div>
  </div>
)}

    </main>
  );
};

export default JobDetails2;

