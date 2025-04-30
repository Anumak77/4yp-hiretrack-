import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../components/style.css'; 

const JobSeekerDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const jobSeeker = location.state || {};

  const handleChat = (jobSeeker) => {
    navigate(`/recruiterchat/${jobSeeker}`);
  };

  if (!location.state) {
    return (
      <main className="job-details__container">
        <section className="job-details__card">
          <div className="job-details__header">
            <button className="job-details__button" onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
          <h1 className="job-details__title">Job Seeker Not Found</h1>
          <p>Please select a job seeker from the search page.</p>
        </section>
      </main>
    );
  }


  return (
    <main className="job-details__container">
      <section className="job-details__card">
        <div className="job-details__header">
          <button className="job-details__button" onClick={() => navigate(-1)}>Go Back</button>
          <button className="job-details__button"  onClick={() => handleChat(jobSeeker.uid)}>Reach Out</button>
        </div>

        <h1 className="job-details__title">Job Seeker Details</h1>

        <p><strong>Name:</strong> {jobSeeker.first_name} {jobSeeker.last_name}</p>
        <p><strong>Location:</strong> {jobSeeker.location}</p>
        <p><strong>Industry:</strong> {jobSeeker.industry}</p>
        <p><strong>Experience:</strong> {jobSeeker.experience}</p>
        <p><strong>Qualifications:</strong> {jobSeeker.qualifications}</p>
        {/*<p><strong>Past Jobs:</strong> {jobSeeker.jobsAppliedFor.join(", ")}</p>*/}
      </section>
    </main>
  );
};

export default JobSeekerDetails;