import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../components/style.css';

const EditJob = ({ jobPostings, setJobPostings }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const jobToEdit = jobPostings.find((job) => job.id === parseInt(id));

  const [editedJob, setEditedJob] = useState({
    id: '',
    title: '',
    company: '',
    location: '',
    description: ''
  });

  useEffect(() => {
    if (jobToEdit) {
      setEditedJob(jobToEdit);
    }
  }, [jobToEdit]);

  if (!jobToEdit) {
    return <div>Job not found!</div>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedJob((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setJobPostings((prevPostings) =>
      prevPostings.map((job) => (job.id === editedJob.id ? editedJob : job))
    );
    navigate('/viewjobpostings');
  };

  return (
    <main className="edit-job-container">
      <h1 className="edit-job-title">Edit Job</h1>
      <form onSubmit={handleSubmit} className="edit-job-form">
        <div className="input-group">
          <label>Job Title:</label>
          <input
            name="title"
            value={editedJob.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <label>Company:</label>
          <input
            name="company"
            value={editedJob.company}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <label>Location:</label>
          <input
            name="location"
            value={editedJob.location}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <label>Description:</label>
          <textarea
            name="description"
            value={editedJob.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="button-container">
          <button type="submit" className="save-button">
            Save Changes
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate('/viewjobpostings')}
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
};

export default EditJob;
