import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../components/style.css';

const mockApplications = [
  {
    title: 'Frontend Developer',
    company: 'Acme Corp',
    date: 'March 10, 2025',
    matchScore: 92,
  },
  {
    title: 'Backend Engineer',
    company: 'BetaTech Solutions',
    date: 'March 15, 2025',
    matchScore: 78,
  },
  {
    title: 'Full Stack Developer',
    company: 'Innovatech',
    date: 'March 18, 2025',
    matchScore: 54,
  },
];

const otherJobs = [
  { title: 'React Native Developer', company: 'Greenbyte', matchScore: 88 },
  { title: 'DevOps Engineer', company: 'CloudCraft', matchScore: 63 },
  { title: 'Data Analyst', company: 'InsightWorks', matchScore: 59 },
  { title: 'UI/UX Designer', company: 'PixelPlay', matchScore: 72 },
  { title: 'QA Tester', company: 'BugSquashers Inc.', matchScore: 66 },
  { title: 'Technical Writer', company: 'DocuPro', matchScore: 81 },
];


const ViewAppliedJobs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const seeker = location.state;

  const [applications, setApplications] = useState([]);

  useEffect(() => {
    if (seeker) {
      setApplications(mockApplications);
    } else {
      navigate('/');
    }
  }, [seeker, navigate]);

  const getScoreClass = (score) => {
    if (score > 85) return 'score-high';
    if (score >= 60) return 'score-medium';
    return 'score-low';
  };

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
      <h3 className="other-job-title">{job.title}</h3>
      <p className="other-job-company">{job.company}</p>
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
        onClick={() => alert('Reaching out to User')}
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
        <h3 className="other-job-title">{job.title}</h3>
        <p className="other-job-company">{job.company}</p>
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
