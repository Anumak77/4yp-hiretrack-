import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { fetchPdfFromFirestore,addJobToFirestore } from '../components/utils';
import '../components/style.css'; 

const JobDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const job = location.state;

  if (!job) {
    return <p className="job-details__no-job">No job details available.</p>;
  }

  const compareWithDescription = async () => {
    try {
      const cvBase64 = await fetchPdfFromFirestore();
      const jobDescription = job['JobDescription'];

      if (!cvBase64) {
        alert('No CV found for the user. Please upload a CV.');
        return;
      }

      const response = await axios.post('http://127.0.0.1:5000/compare_with_description', {
        JobDescription: jobDescription,
        cv: cvBase64.split(',')[1],
      });

      const similarityScore = response.data['cosine similarity'];
      alert(`Your match score with this job is: ${(similarityScore * 100).toFixed(2)}%`);
    } catch (error) {
      console.error('Error comparing CV with job description:', error);
      alert('An error occurred. Please try again.');
    }
  };


    const handleSubmitofsaveJobUpload = async (e) => {
      e.preventDefault();
  
      if (!job) {
        console.log('Please select a PDF to upload.');
        return;
      }
  
      try {
        await addJobToFirestore(job, 'savedjobs');
        console.log('job added succesfully');
      } catch (error) {
        console.log('error uploading job');
      }
    };

    const handleSubmitofapplyJobUpload = async (e) => {
      e.preventDefault();
  
      if (!job) {
        console.log('Please select a PDF to upload.');
        return;
      }
  
      try {
        await addJobToFirestore(job,'appliedjobs');
        console.log('job added succesfully');
      } catch (error) {
        console.log('error uploading job');
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
    </main>
  );
};

export default JobDetails;
