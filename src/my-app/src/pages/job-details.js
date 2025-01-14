import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const JobDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const recruiter = location.state;

  if (!recruiter) {
    return <p>No job details available.</p>;
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8c8dc',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        padding: '20px',
      }}
    >
      <section
        style={{
          position: 'relative',
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0px 6px 16px rgba(200, 120, 140, 0.3)',
          textAlign: 'left',
          maxWidth: '800px',
          width: '100%',
        }}
      >
        <button
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '10px 16px',
            backgroundColor: '#ff69b4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          Apply for Job
        </button>

        <h1 style={{ color: '#ff69b4', marginBottom: '20px' }}>Job Details</h1>

        <p>
          <strong>Job Title:</strong> {recruiter['Job Title']}
        </p>
        <p>
          <strong>Company Name:</strong> {recruiter['Company Name']}
        </p>
        <p>
          <strong>Location:</strong> {recruiter['Location']}
        </p>
        <p>
          <strong>Job Description:</strong> {recruiter['Job Description']}
        </p>
        <p>
          <strong>Required Qualifications:</strong> {recruiter['Required Qualifications']}
        </p>
        <p>
          <strong>Salary Details:</strong> {recruiter['Salary Details']}
        </p>
        <p>
          <strong>Start Date:</strong> {recruiter['Start Date']}
        </p>
        <p>
          <strong>Application Deadline:</strong> {recruiter['Application Deadline']}
        </p>

        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#ff69b4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Go Back
        </button>
      </section>
    </main>
  );
};

export default JobDetails;
