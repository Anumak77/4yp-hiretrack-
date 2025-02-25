import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import '../../components/style.css';

const ViewJobPostings = () => {
    const navigate = useNavigate();
    const [jobPostings, setJobPostings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchJobPostings = async () => {
      try {
        const user = getAuth().currentUser;
        if (!user) throw new Error('User not authenticated');
    
        
        const idToken = await user.getIdToken();
        if (!idToken) throw new Error('Failed to get ID token');
    
        
        const response = await fetch('http://localhost:5000//fetch-jobs', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': idToken, 
          },
        });
    
        
        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }
    
        
        const jobs = await response.json();
        setJobPostings(jobs);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching job postings:', error);
        setError(error.message);
        setLoading(false);
      }
    };
    useEffect(() => {
      fetchJobPostings();
    }, []);

  const handleEdit = (id) => {
    navigate(`/edit-job/${id}`);
  };

  const handleViewInsights = (id) => {
    console.log(`View insights for job posting with ID: ${id}`);
  };

  const handleDelete = async (id) => {
    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error('User not authenticated');
  
      
      const idToken = await user.getIdToken();
      if (!idToken) throw new Error('Failed to get ID token');
  
      
      const response = await fetch(`http://localhost:5000/delete-job/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': idToken, 
        },
      });
  
      
      if (!response.ok) {
        throw new Error('Failed to delete job');
      }
  
      
      setJobPostings(jobPostings.filter(job => job.id !== id));
      console.log(`Deleted job posting with ID: ${id}`);
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  return (
    <main className="view-job-container">
      <div className="view-job-header">
        <button type="button" className="back-button-jobposting" onClick={() => navigate('/dashboard-recruiter')}>Go Back</button>
      </div>
      <h1 className="view-job-title">Job Postings</h1>
      <section className="job-list">
        {jobPostings.map((job) => (
          <div key={job.id} className="job-card">
            <button className="delete-button" onClick={() => handleDelete(job.id)}>Delete</button>
            <div className="job-card-header">
              <h2 className="job-card-title">{job.Title}</h2>
              <p className="job-card-company">{job.AboutC} - {job.Location}</p>
            </div>
            <p className="job-card-description">{job.JobDescription}</p>
            <div className="job-card-actions">
              <button className="action-button" onClick={() => handleEdit(job.id)}>Edit</button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
};

export default ViewJobPostings;