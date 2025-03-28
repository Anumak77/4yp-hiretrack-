import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../../components/firebaseconfigs'; 
import '../../components/style.css';

const JobDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const job = location.state; 
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState(""); 
  const [popupType, setPopupType] = useState(""); 
  const [matchScore, setMatchScore] = useState(null);
  const [base64Data, setBase64Data] = useState(null); 
  

  const closePopup = () => {
    setShowPopup(false);
  };

  if (!job) {
    return <p className="job-details__no-job">No job details available.</p>;
  }


  const fetchPdfFromFlaskBackend = async () => {
    try {
      // If you’re using Firebase Auth:
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Get the ID token from Firebase (if needed)
      const idToken = await user.getIdToken();
      if (!idToken) throw new Error('Failed to get ID token');

      const response = await fetch('http://127.0.0.1:5000/fetch-pdf', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: idToken, // custom header
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData?.error || 'Failed to fetch CV';
        throw new Error(errorMsg);
      }

      const result = await response.json();
      if (result.fileData) {
        return result.fileData; // Base64 string from server
      } else {
        throw new Error(result.error || 'No CV found for user');
      }
    } catch (error) {
      console.error('Error fetching CV:', error);
      alert(error.message || 'Error fetching CV.');
      throw error;
    }
  };

  const compareWithDescription = async () => {
    try {
      let cvBase64 = base64Data;
      if (!cvBase64) {
        cvBase64 = await fetchPdfFromFlaskBackend();
      }
      if (!cvBase64) {
        alert("No CV found for the user. Please upload a CV.");
        return;
      }
  
      if (cvBase64.startsWith("data:")) {
        cvBase64 = cvBase64.split(",")[1];
      }
  
      const jobDescription = job.JobDescription || "";
      const jobRequirment = job.JobRequirment || "";
      const requiredQual = job.RequiredQual || "";
  
      const response = await fetch("http://127.0.0.1:5000/compare_with_description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          JobDescription: jobDescription,
          JobRequirment: jobRequirment,
          RequiredQual: requiredQual,
          cv: cvBase64,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Compare request failed: ${response.statusText}`);
      }
  
      const data = await response.json();
      const similarityScore = data.cosine_similarity || 0;
      const matchScorePercentage = (similarityScore * 100).toFixed(2);
  
      setMatchScore(matchScorePercentage);
      setPopupMessage(""); 
      setPopupType("match"); 
      setShowPopup(true);
    } catch (error) {
      console.error("Error comparing CV with job description:", error);
      alert("An error occurred. Please try again.");
    }
  };
  

  const handleSaveJob = async (e) => {
    e.preventDefault();
    if (!job) {
      console.log("Please select a job to save.");
      return;
    }
    try {
      const response = await fetch("http://127.0.0.1:5000/save-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "currentUserId",
          job: job,
        }),
      });
  
      const result = await response.json();
      if (response.ok) {
        console.log("Job saved successfully:", result.message);
        setPopupMessage("Job saved successfully!"); 
        setPopupType("save"); 
        setShowPopup(true);
      } else {
        console.log("Error saving job:", result.error);
        setPopupMessage("Error saving job. Please try again.");
        setPopupType("save");
        setShowPopup(true);
      }
    } catch (error) {
      console.log("Error saving job:", error);
      setPopupMessage("Error saving job. Please try again.");
      setPopupType("save"); 
      setShowPopup(true);
    }
  };
  

  const handleApplyJob = async (e) => {
    e.preventDefault();
    if (!job) {
      console.error('No job to apply for.');
      return;
    }
    try {
      // If using Firebase Auth:
      const user = auth.currentUser;
      if (!user) {
        alert('Please sign in to apply for jobs.');
        return;
      }

      // Optionally fetch or verify CV again
      let cvBase64 = base64Data;
      if (!cvBase64) {
        cvBase64 = await fetchPdfFromFlaskBackend();
      }
      if (!cvBase64) {
        alert('No CV found. Please upload a CV.');
        return;
      }
      if (cvBase64.startsWith('data:')) {
        cvBase64 = cvBase64.split(',')[1];
      }

      // Prepare request
      const payload = {
        userId: user.uid,
        job,
        cv: cvBase64,
      };

      // Send request to apply
      const response = await fetch('http://127.0.0.1:5000/apply-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.ok) {
        console.log("Job applied successfully:", result.message);
        setPopupMessage("Job applied successfully!"); 
        setPopupType("save"); 
        setShowPopup(true);
      } else {
        console.log("Error applying for job:", result.error);
        setPopupMessage("Error applying job. Please try again.");
        setPopupType("save");
        setShowPopup(true);
      }
    } catch (error) {
      console.log("Error applying job:", error);
      setPopupMessage("Error applying job. Please try again.");
      setPopupType("save"); 
      setShowPopup(true);
    }
  };

  return (
    <main className="job-details__container">
      <section className="job-details__card">
        <div className="job-details__header">
          {/* Go back button */}
          <button className="job-details__button" onClick={() => navigate(-1)}>
            Go Back
          </button>
          {/* Save Job button */}
          <button className="job-details__button" onClick={handleSaveJob}>
            Save Job
          </button>
        </div>

        <h1 className="job-details__title">Job Details</h1>

        {/* Basic fields */}
        <p><strong>Job Title:</strong> {job.Title || "N/A"}</p>
        <p><strong>Company:</strong> {job.Company || "N/A"}</p>
        <p><strong>Location:</strong> {job.Location || "N/A"}</p>
        <p><strong>Job Description:</strong> {job.JobDescription || "N/A"}</p>

        {/* Requirements */}
        <p><strong>Job Requirements:</strong></p>
        <ul>
          {job.JobRequirment?.split(';').map((req, index) => (
            <li key={index}>{req.trim()}</li>
          ))}
        </ul>

        {/* Qualifications */}
        <p><strong>Required Qualifications:</strong></p>
        <ul>
          {job.RequiredQual?.split(';').map((qual, index) => (
            <li key={index}>{qual.trim()}</li>
          ))}
        </ul>

        {/* Start date and deadline */}
        <p><strong>Start Date:</strong> {job.OpeningDate || "N/A"}</p>
        <p><strong>Application Deadline:</strong> {job.Deadline || "N/A"}</p>

        {/* Action buttons */}
        <div className="job-details__actions">
          <button className="job-details__button" onClick={handleApplyJob}>
            Apply for Job
          </button>
          <button className="job-details__button" onClick={compareWithDescription}>
            Get Match Score
          </button>
        </div>
      </section>

      {/* Popup for match score */}
      {showPopup && (
      <div className="popup-overlay">
        <div className="popup-content">
          {popupType === "match" ? (
            <p>Your match score with this job is: {matchScore}%</p>
          ) : (
            <p>{popupMessage}</p>
          )}
          <button className="popup-cancel-button" onClick={closePopup}>
            Close
          </button>
        </div>
      </div>
    )}


    </main>
  );
};

export default JobDetails;
