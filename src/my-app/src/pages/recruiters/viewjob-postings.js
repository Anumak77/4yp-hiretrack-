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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);

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
  const confirmed = window.confirm("Are you sure you want to delete this job posting? This action cannot be undone.");
  if (!confirmed) return;

  try {
    const user = getAuth().currentUser;
    if (!user) throw new Error('User not authenticated');

    const idToken = await user.getIdToken();
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



const handleTagInput = async (id, e) => {
  if (e.key === 'Enter') {
    e.preventDefault();   
    const newTag = e.target.value.trim();
    if (!newTag) return;
    
    try {
      const user = getAuth().currentUser;
      if (!user) throw new Error('User not authenticated');
      const idToken = await user.getIdToken();
      
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
      setJobPostings(prevJobs =>
        prevJobs.map(job =>
          job.id === id ? { ...job, tags: data.tags } : job
        )
      );
      e.target.value = '';
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

const handleDeleteClick = (id) => {
  setJobToDelete(id);
  setShowDeleteModal(true);
};

const handleDeleteConfirm = async () => {
  if (!jobToDelete) return;

  try {
    const user = getAuth().currentUser;
    if (!user) throw new Error('User not authenticated');

    const idToken = await user.getIdToken();
    const response = await fetch(`http://localhost:5000/delete-job/${jobToDelete}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': idToken,
      },
    });

    if (!response.ok) throw new Error('Failed to delete job');

    setJobPostings(jobPostings.filter(job => job.id !== jobToDelete));
    setShowDeleteModal(false);
  } catch (error) {
    console.error('Error deleting job:', error);
  }
};



  return (
<main className="vj-container">
  <div className="vj-header">
    <button className="vj-back-button" onClick={() => navigate("/dashboard-recruiter")}>
      Go Back
    </button>
  </div>

  <h1 className="vj-title">Job Postings</h1>

  {jobPostings.length > 0 ? (
    jobPostings.map((job) => (
      <div key={job.id} className="vj-card">
      <div className="vj-left">
        <div className="vj-card-header">
          <h2 className="vj-card-title">{job.Title}</h2>
          <p className="vj-card-subtitle">{job.Company} - {job.Location}</p>
        </div>
        <div className="vj-tags">
          {job.tags?.map((tag, index) => (
            <span key={index} className="vj-tag">
              {tag} <span className="vj-remove-tag" onClick={() => handleRemoveTag(job.id, tag)}></span>
            </span>
          ))}
          <input
            type="text"
            placeholder="Add a tag..."
            className="vj-tag-input"
            onKeyDown={(e) => handleTagInput(job.id, e)}
          />
        </div>
      </div>
    
      <div className="vj-right">
        <button className="vj-btn view" onClick={() => navigate(`/viewapplicants/${job.id}`)}>View Applicants</button>
        <button className="vj-btn edit" onClick={() => handleEdit(job.id)}>Edit</button>
        <button 
          className="vj-btn delete" 
          onClick={() => handleDeleteClick(job.id)}
        >
          Delete
        </button>
      </div>
    </div>
    

    ))
  ) : (
    <p className="vj-empty">No job postings found.</p>
  )}
  {showDeleteModal && (
  <div className="confirmation-modal">
    <div className="confirmation-content">
      <h2>Delete Job Posting</h2>
      <p>Are you sure you want to delete this job? This action cannot be undone.</p>
      <div className="confirmation-buttons">
        <button 
          className="confirm-button delete-btn" 
          onClick={handleDeleteConfirm}
        >
          Delete
        </button>
        <button 
          className="cancel-button" 
          onClick={() => setShowDeleteModal(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
</main>

);
}

export default ViewJobPostings;

