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
        if (base64Data) {
        cvBase64 = base64Data;
      } else {
        cvBase64 = await fetchPdfFromFlaskBackend();
      }
  
      console.log('CV Base64 Data (before split):', cvBase64);

      const jobDescription = job['JobDescription'];
      console.log('Job Description:', jobDescription);
  
      if (!cvBase64) {
        alert('No CV found for the user. Please upload a CV.');
        return;
      }
        cvBase64 = cvBase64.trim();
  
      let cv;
      if (cvBase64.startsWith('data:')) {
        cv = cvBase64.split(',')[1];
      } else {
        cv = cvBase64;
      }
  
      console.log('CV Base64 Data (after handling):', cv);
  
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
  
     
      console.log('Comparison Response:', response.data);
  
      const similarityScore = response.data['cosine_similarity']; 
      console.log('Similarity Score:', similarityScore);
  
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

  const handleSubmitofapplyJobUpload = async (e) => {
    e.preventDefault();

    try {
        const user = auth.currentUser;
        if (!user) {
            console.error('User not authenticated.');
            alert('Please sign in to apply for jobs.'); 
            return;
        }

        const userId = user.uid; // Get the user's UID

        let cvBase64;
        if (base64Data) {
            cvBase64 = base64Data;
        } else {
            cvBase64 = await fetchPdfFromFlaskBackend();
        }

        console.log('CV Base64 Data (before split):', cvBase64);

        if (!cvBase64) {
            alert('No CV found for the user. Please upload a CV.');
            return;
        }

        
        cvBase64 = cvBase64.trim();
        let cv;
        if (cvBase64.startsWith('data:')) {
            cv = cvBase64.split(',')[1]; 
        } else {
            cv = cvBase64; 
        }

        console.log('CV Base64 Data (after handling):', cv);

        
        const payload = {
            userId: userId, 
            job: job, 
            cv: cv, 
        };

        console.log('Request Payload:', payload);

        // Send the payload to the backend
        const response = await axios.post('http://127.0.0.1:5000/apply-job', payload, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = response.data;
        console.log("Response received:", result);

        if (response.status === 200) {
            console.log('Job applied successfully:', result.message);
            alert('Job applied successfully!'); 
        } else {
            console.error('Error applying to job:', result.error);
            alert('Error applying to job. Please try again.'); 
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.'); 
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
