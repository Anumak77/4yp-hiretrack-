import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, getDocs, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import "../../components/style.css";

const ViewJobPostings = () => {
  const navigate = useNavigate();
  const [jobPostings, setJobPostings] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const db = getFirestore();
  const auth = getAuth();


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


const handleTagInput = async (id, event) => {
  if (event.key === "Enter" && event.target.value.trim()) {
      const newTag = event.target.value.trim();

      try {
          const idToken = await getAuth().currentUser.getIdToken();
          const response = await fetch('http://localhost:5000/add-tag', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': idToken,
              },
              body: JSON.stringify({
                  job_id: id,
                  tag: newTag,
              }),
          });

          if (!response.ok) {
              throw new Error('Failed to add tag');
          }

          const data = await response.json();
          setJobPostings(prev => prev.map(job => job.id === id ? { ...job, tags: data.tags } : job));
          event.target.value = "";
      } catch (error) {
          console.error('Error adding tag:', error);
      }
  }
};

const handleRemoveTag = async (id, tagToRemove) => {
try {
    const idToken = await getAuth().currentUser.getIdToken();
    const response = await fetch('http://localhost:5000/remove-tag', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': idToken,
        },
        body: JSON.stringify({
            job_id: id,
            tag: tagToRemove,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to remove tag');
    }

    const data = await response.json();
    setJobPostings(prev => prev.map(job => job.id === id ? { ...job, tags: data.tags } : job));
} catch (error) {
    console.error('Error removing tag:', error);
}
};


  return (
    <main className="view-job-container">
      <div className="view-job-header">
        <button className="back-button-viewjob-back" onClick={() => navigate("/dashboard-recruiter")}>
          Go Back
        </button>
      </div>
      <h1 className="view-job-title">Job Postings</h1>



        {jobPostings.length > 0 ? (
          jobPostings.map((job) => (
            <div key={job.id} className="job-card">
              <div className="job-card-header">
                <h2 className="job-card-title">{job.Title}</h2>
                <p className="job-card-company">{job.Company} - {job.Location}</p>
              </div>
              <p className="job-card-description">{job.Description}</p>



              <div className="job-tags">
                {job.tags && job.tags.map((tag, index) => (
                  <span key={index} className="job-tag">
                    {tag} <span className="remove-tag" onClick={() => handleRemoveTag(job.id, tag)}>❌</span>
                  </span>
                ))}
                <input type="text" placeholder="Add a tag..." className="tag-input" onKeyDown={(e) => handleTagInput(job.id, e)} />
              </div>

              <div className="job-card-actions">
                <button className="view-applicants-button" onClick={() => navigate(`/viewapplicants/${job.id}`)}>
                  View Applicants
                </button>
                <button className="edit-button" onClick={() => handleEdit(job.id)}>
                  Edit
                </button>
                <button className="delete-button" onClick={() => handleDelete(job.id)}>
                  Delete
                  </button>
          </div>
        </div>
      ))
    ) : (
      <p>No job postings found.</p>
    )}
  </main>
);
}

export default ViewJobPostings;

