import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../components/style.css';

const ViewJobPostings = ({ jobPostings = [], setJobPostings = () => {} }) => {
  const navigate = useNavigate();

  const handleEdit = (id) => {
    navigate(`/editjobpostings/${id}`);
  };

  const handleDelete = (id) => {
    setJobPostings(jobPostings.filter((job) => job.id !== id));
  };

  return (
    <main className='view-job-container'>

<button
  type="button"
  className="back-button-viewjob-back"
  onClick={() => navigate('/dashboard-recruiter')}
>
  Go Back
</button>

      <h1 className='view-job-title'>Job Postings</h1>
      <section className='job-list'>
        {jobPostings.map((job) => (
          <div key={job.id} className='job-card'>
            <button className='delete-button' onClick={() => handleDelete(job.id)}>
              Delete
            </button>
            <button className='action-button' onClick={() => handleEdit(job.id)}>
                Edit
              </button>
            <div className='job-card-header'>
              <h2 className='job-card-title'>{job.title}</h2>
              <p className='job-card-company'>
                {job.company} - {job.location}
              </p>
            </div>
            <p className='job-card-description'>{job.description}</p>
            <div className='job-card-actions'>

            <button className='action-button' onClick={() => navigate('/viewapplicants')}>
                View Applicants
              </button>

            </div>
          </div>
        ))}
      </section>
    </main>
  );
};

export default ViewJobPostings;
