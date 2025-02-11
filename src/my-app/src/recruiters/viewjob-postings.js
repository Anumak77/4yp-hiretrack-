import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/style.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { fetchJobsPosting } from '../components/utils';

const ViewJobPostings = () => {
  const navigate = useNavigate();
  const [jobPostings, setJobPostings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobs = await fetchJobsPosting('jobposting'); 
        setJobPostings(jobs)
      } catch (error) {
        console.error("Error fetching job postings:", error);
      } finally {
        setLoading(false);
      }
    };

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchJobs(user.uid);
      } else {
        console.error("User not authenticated.");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);  

    

  const handleEdit = (job) => {
    navigate("/createpost", { state: { job } });
  };

  const handleDelete = async (id) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("User not authenticated.");
        return;
      }

      const firestore = getFirestore();
      await deleteDoc(doc(firestore, `users/${user.uid}/jobposting`, id));

      setJobPostings(prevJobs => prevJobs.filter(job => job.id !== id));
      console.log(`Deleted job posting with ID: ${id}`);
    } catch (error) {
      console.error("Error deleting job posting:", error);
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
              <p className="job-card-company">{job.Company} - {job.Location}</p>
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