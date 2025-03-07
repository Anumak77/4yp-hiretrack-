import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth, firestore, realtimeDb } from '../../components/firebaseconfigs.js';
import axios from 'axios';
import '../../components/style.css';

const JobDetails = () => {
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
      let cvBase64;
  
      // Check if CV data is already available
      if (base64Data) {
        cvBase64 = base64Data;
      } else {
        // Fetch CV data from the Flask backend
        cvBase64 = await fetchPdfFromFlaskBackend();
      }
  
      // Log the CV data for debugging
      console.log('CV Base64 Data (before split):', cvBase64);
  
      // Get the job description
      const jobDescription = job['JobDescription'];
      console.log('Job Description:', jobDescription);
  
      // Validate CV data
      if (!cvBase64) {
        alert('No CV found for the user. Please upload a CV.');
        return;
      }
  
      // Trim any leading/trailing whitespace
      cvBase64 = cvBase64.trim();
  
      // Handle both data URL and pure base64 strings
      let cv;
      if (cvBase64.startsWith('data:')) {
        // If cvBase64 is a data URL, split it to extract the base64 data
        cv = cvBase64.split(',')[1];
      } else {
        // If cvBase64 is already a pure base64 string, use it directly
        cv = cvBase64;
      }
  
      console.log('CV Base64 Data (after handling):', cv);
  
      // Prepare the payload
      const payload = {
        JobDescription: jobDescription,
        cv: cv, // Use the processed value
      };
      console.log('Request Payload:', payload);
  
      // Send the CV and job description to the Flask backend for comparison
      const response = await axios.post('http://127.0.0.1:5000/compare_with_description', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      // Log the response for debugging
      console.log('Comparison Response:', response.data);
  
      // Extract the similarity score
      const similarityScore = response.data['cosine_similarity']; // Ensure the key matches the backend response
      console.log('Similarity Score:', similarityScore);
  
      // Convert the similarity score to a percentage and update the state
      const matchScorePercentage = (similarityScore * 100).toFixed(2);
      setMatchScore(matchScorePercentage);
      setShowPopup(true);
    } catch (error) {
      console.error('Error comparing CV with job description:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleSubmitofsaveJobUpload = async (e) => {
    e.preventDefault();

    if (!job) {
      console.log('Please select a job to save.');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/save-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'currentUserId', 
          job: job,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        console.log('Job saved successfully:', result.message);
      } else {
        console.log('Error saving job:', result.error);
      }
    } catch (error) {
      console.log('Error saving job:', error);
    }
  };

  const checkForCV = async (userId) => {
    try {
        const response = await fetch(`http://127.0.0.1:5000/fetch-pdf`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': await auth.currentUser.getIdToken(),
            },
        });

        const result = await response.json();
        if (result.fileData) {
            return true; // CV exists
        } else {
            return false; // CV does not exist
        }
    } catch (error) {
        console.error('Error checking for CV:', error);
        return false;
    }
};

  const handleSubmitofapplyJobUpload = async (e) => {
    e.preventDefault();

    if (!job) {
        console.error('Please select a job to apply.');
        return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
          console.error('User not authenticated.');
          return;
      }

      const userId = user.uid; 
      
      const hasCV = await checkForCV(userId);
        if (!hasCV) {
            alert('No CV found. Please upload a CV before applying.');
            return;
        }

        console.log("Sending request with userId:", userId);
        const response = await fetch('http://127.0.0.1:5000/apply-job', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
                job: job,
            }),
        });

        const result = await response.json();
        console.log("Response received:", result);

        if (response.ok) {
            console.log('Job applied successfully:', result.message);
        } else {
            console.error('Error applying to job:', result.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};


  return (
    <main className="job-details__container">
      <section className="job-details__card">
        <div className="job-details__header">
          <button className="job-details__button" onClick={() => navigate(-1)}>Go Back</button>
          <button className="job-details__button"onClick={handleSubmitofsaveJobUpload} >Save Job</button>
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
          <button className="job-details__button" onClick={handleSubmitofapplyJobUpload}>Apply for Job</button>
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

export default JobDetails;
