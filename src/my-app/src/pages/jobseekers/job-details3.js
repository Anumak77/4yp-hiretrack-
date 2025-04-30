import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth, firestore, realtimeDb } from '../../components/firebaseconfigs.js';
import '../../components/style.css';

const JobDetails3 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const job = location.state;
  const [showPopup, setShowPopup] = useState(false);
  const [matchScore, setMatchScore] = useState(null);
  const[base64Data, setBase64Data] = useState(null);

  if (!job) {
    return <p className="job-details__no-job">No job details available.</p>;
  }


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

      </section>

    </main>
  );
};

export default JobDetails3;

