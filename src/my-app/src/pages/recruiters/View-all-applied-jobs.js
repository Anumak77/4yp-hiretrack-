import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate,  useParams } from 'react-router-dom';
import '../../components/style.css';
import { getAuth } from "firebase/auth";

const ViewAppliedJobs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const seeker = location.state;
  const auth = getAuth();
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const otherJobs = []
  const [matchScores, setMatchScores] = useState({});
  const [loadingScores, setLoadingScores] = useState({});


  const getScoreClass = (score) => {
    if (score > 85) return 'score-high';
    if (score >= 60) return 'score-medium';
    return 'score-low';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!seeker) {
          navigate('/');
          return;
        }

        console.log(seeker.uid)
  
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          throw new Error("Not authenticated");
        }
  
        const idToken = await user.getIdToken();
        
        const response = await fetch(
          `http://localhost:5000/fetch-jobseeker-applied-jobs/${seeker.uid}/appliedjobs`, 
          {
            method: "GET",
            headers: {
              "Authorization": idToken,
              "Content-Type": "application/json"
            }
          }
        );
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch jobseeker jobs");
        }
  
        const jobs = await response.json();
        console.log(jobs)
        setApplications(jobs);
  
      } catch (error) {
        console.error("Error fetching jobseeker jobs:", error);
      }
    };
  
    fetchData();
  }, [seeker, navigate]);

  
const handleChat = (applicantId) => {
    navigate(`/recruiterchat/${applicantId}`);};


  return (
    <div className="view-applied-container">
      <h1 className="view-applied-title">
        Applied Jobs for: <span className="view-applied-name">{seeker?.first_name} {seeker?.last_name}</span>
      </h1>

      <div className="go-back-container">
        <button
          onClick={() => navigate(-1)}
          className="go-back-button"
        >
          Go Back
        </button>
      </div>

      {/* Applied Jobs */}
      <div className="job-cards-container">
  {applications.map((job, index) => (
    <div className="other-job-card">
    <div>
      <h3 className="other-job-title">{job.Title}</h3>
      <p className="other-job-company">{job.Company}</p>
      <p className="other-job-score">
        <strong>Applied on:</strong> {job.date}<br />
        <strong>Match Score:</strong>{' '}
        <span className={`match-score ${getScoreClass(job.matchScore)}`}>
          {job.matchScore}%
        </span>
      </p>
    </div>
  
    <div className="other-job-buttons">
      <button
        className="other-job-offer-button"
        onClick={() => alert('View job posting detail')}
      >
        View Job Posting
      </button>
      <button
        className="other-job-offer-button"
        onClick={() => handleChat(seeker.uid)}
      >
        Reach Out
      </button>
    </div>
  </div>
  
  ))}
</div>

      {/* Other Jobs Section */}
      <div className="other-jobs-section">
        <h2 className="other-jobs-title">Other Possible Jobs</h2>
        <div className="other-jobs-container">
  {otherJobs.map((job, index) => (
    <div key={index} className="other-job-card">
      <div>
        <h3 className="other-job-title">{job.Title}</h3>
        <p className="other-job-company">{job.Company}</p>
        <p className="other-job-score">
          <strong>Match Score:</strong>{' '}
          <span className={`match-score ${getScoreClass(job.matchScore)}`}>
            {job.matchScore}%
          </span>
        </p>
      </div>

      <div className="other-job-buttons">
        <button
          className="other-job-offer-button"
          onClick={() => alert('View job posting detail')}
        >
          View Job Posting
        </button>
        <button
          className="other-job-offer-button"
          onClick={() => alert('Reaching out to User')}
        >
          Reach Out
        </button>
      </div>
    </div>
  ))}



      </div>


      </div>
    </div>
  );
};

export default ViewAppliedJobs;
