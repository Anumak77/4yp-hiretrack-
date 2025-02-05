import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/style.css'; 

const JobSeekerDetails = () => {
  const navigate = useNavigate();

  const jobSeeker = {
    firstName: "Alice",
    lastName: "Johnson",
    location: "New York, USA",
    industry: "Software Engineering",
    experience: "5 years",
    qualifications: "B.Sc. in Computer Science",
    jobsAppliedFor: ["Frontend Developer at Google", "Software Engineer at Microsoft", "Full Stack Developer at Amazon"]
  };

  return (
    <main className="job-details__container">
      <section className="job-details__card">
        <div className="job-details__header">
          <button className="job-details__button" onClick={() => navigate(-1)}>Go Back</button>
          <button className="job-details__button" onClick={() => navigate('/jobseekerchat')}>Reach Out</button>
        </div>

        <h1 className="job-details__title">Job Seeker Details</h1>

        <p><strong>Name:</strong> {jobSeeker.firstName} {jobSeeker.lastName}</p>
        <p><strong>Location:</strong> {jobSeeker.location}</p>
        <p><strong>Industry:</strong> {jobSeeker.industry}</p>
        <p><strong>Experience:</strong> {jobSeeker.experience}</p>
        <p><strong>Qualifications:</strong> {jobSeeker.qualifications}</p>
        <p><strong>Past Jobs:</strong> {jobSeeker.jobsAppliedFor.join(", ")}</p>
      </section>
    </main>
  );
};

export default JobSeekerDetails;