import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios'
import { savePdfToFirestore, fetchPdfFromFirestore } from '../components/utils';

const JobDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const job = location.state;

  if (!job) {
    return <p>No job details available.</p>;
  }

  const compareWithDescription = async () => {
    try {
      const cvBase64 = await fetchPdfFromFirestore();
      const jobDescription = job['JobDescription']; // Ensure `job` is passed correctly
  
      if (!cvBase64) {
        alert('No CV found for the user. Please upload a CV.');
        return;
      }
  
      const response = await axios.post('http://127.0.0.1:5000/compare_with_description', {
        JobDescription: jobDescription,
        cv: cvBase64.split(',')[1], // Send only the data part of Base64
      });
  
      const similarityScore = response.data['cosine similarity'];
      alert(`Your match score with this job is: ${(similarityScore * 100).toFixed(2)}%`);
    } catch (error) {
      console.error('Error comparing CV with job description:', error);
      alert('An error occurred. Please try again.');
    }
  };

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
        <h1 style={{ color: '#ff69b4', marginBottom: '20px' }}>Job Details</h1>

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
          Save Job 
        </button>
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
          Apply for Job 
        </button>
        <button
          onClick={compareWithDescription}
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
          Get Match Score 
        </button>
      </section>
    </main>
  );
};

export default JobDetails;
