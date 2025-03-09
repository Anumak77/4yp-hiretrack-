import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, getDocs, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import "../../components/style.css";

const ViewJobPostings = () => {
  const navigate = useNavigate();
  const [jobPostings, setJobPostings] = useState([]);
  const [user, setUser] = useState(null);
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ? firebaseUser : null);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(collection(db, "jobposting"), (snapshot) => {
      const jobs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setJobPostings(jobs);
    });

    return () => unsubscribe();
  }, [user]);

  const handleEdit = (id) => {
    navigate(`/editjobpostings/${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job posting?")) return;

    try {
      const user = getAuth().currentUser;
      if (!user) {
        alert("You need to be logged in to delete a job.");
        return;
      }

      await deleteDoc(doc(db, "jobposting", id));
    } catch (error) {
      alert("Error deleting job. Please try again.");
    }
  };




  const handleTagInput = async (id, event) => {
    if (event.key === "Enter" && event.target.value.trim()) {
      const newTag = event.target.value.trim();
      const jobRef = doc(db, "jobposting", id);
      const job = jobPostings.find(job => job.id === id);
      const updatedTags = [...(job.tags || []), newTag];

      await updateDoc(jobRef, { tags: updatedTags });
      setJobPostings(prev => prev.map(job => job.id === id ? { ...job, tags: updatedTags } : job));
      event.target.value = "";
    }
  };

  const handleRemoveTag = async (id, tagToRemove) => {
    const jobRef = doc(db, "jobposting", id);
    const job = jobPostings.find(job => job.id === id);
    const updatedTags = job.tags.filter(tag => tag !== tagToRemove);

    await updateDoc(jobRef, { tags: updatedTags });
    setJobPostings(prev => prev.map(job => job.id === id ? { ...job, tags: updatedTags } : job));
  };

  return (
    <main className="view-job-container">
      <div className="view-job-header">
        <button className="back-button-viewjob-back" onClick={() => navigate("/dashboard-recruiter")}>
          Go Back
        </button>
      </div>
      <h1 className="view-job-title">Job Postings</h1>

      <section className="job-list">
        {jobPostings.length > 0 ? (
          jobPostings.map((job) => (
            <div key={job.id} className="job-card">
              <div className="job-card-header">
                <h2 className="job-card-title">{job.title}</h2>
                <p className="job-card-company">{job.company} - {job.location}</p>
              </div>
              <p className="job-card-description">{job.description}</p>



              <div className="job-tags">
                {job.tags && job.tags.map((tag, index) => (
                  <span key={index} className="job-tag">
                    {tag} <span className="remove-tag" onClick={() => handleRemoveTag(job.id, tag)}>❌</span>
                  </span>
                ))}
                <input type="text" placeholder="Add a tag..." className="tag-input" onKeyDown={(e) => handleTagInput(job.id, e)} />
              </div>

              <div className="job-card-actions">
                <button className="view-applicants-button" onClick={() => navigate(`/viewapplicants`)}>
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
      </section>
    </main>
  );
};

export default ViewJobPostings;
