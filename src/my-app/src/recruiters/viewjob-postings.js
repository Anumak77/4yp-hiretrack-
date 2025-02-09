import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/style.css';
import { getAuth,  onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';


const ViewJobPostings = () => {
  const navigate = useNavigate();
  const [jobPostings, setJobPostings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobPostings = async (userId) => {
      try {
        const firestore = getFirestore();
        const jobPostingRef = collection(firestore, `users/${userId}/jobposting`);
        const jobQuery = query(jobPostingRef);
        const jobSnapshot = await getDocs(jobQuery);

        const jobs = jobSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setJobPostings(jobs);
      } catch (error) {
        console.error("Error fetching job postings:", error);
      } finally {
        setLoading(false);
      }
    };

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchJobPostings(user.uid);
      } else {
        console.error("User not authenticated.");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);  
    

  const handleEdit = (id) => {
    console.log(`Edit job posting with ID: ${id}`);
  };

  const handleViewInsights = (id) => {
    console.log(`View insights for job posting with ID: ${id}`);
  };

  const handleDelete = (id) => {
    setJobPostings(jobPostings.filter(job => job.id !== id));
    console.log(`Deleted job posting with ID: ${id}`);
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
              <p className="job-card-company">{job.Company} - {job.Location}</p>
            </div>
            <p className="job-card-description">{job.JobDescription}</p>
            <div className="job-card-actions">
              <button className="action-button" onClick={() => handleEdit(job.id)}>Edit</button>
              <button className="action-button" onClick={() => handleViewInsights(job.id)}>View Insights</button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
};

export default ViewJobPostings;