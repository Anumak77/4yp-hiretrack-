import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuth } from "firebase/auth";
import RequestCollabButton from '../jobseekers/RequestCollabButton';

const RecruiterPreviewCV = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { applicantId } = location.state || {};
  const [cvData, setCvData] = useState(null);
  const [jobPostings, setJobPostings] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedJobTitle, setSelectedJobTitle] = useState("");

  const [showNotes, setShowNotes] = useState({
    industry: false,
    education: false,
    experience: false,
    projects: false,
    skills: false,
  });

  const [notes, setNotes] = useState({
    industry: "",
    education: "",
    experience: "",
    projects: "",
    skills: "",
  });

  const toggleNote = (field) => {
    setShowNotes(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  useEffect(() => {
    const fetchCV = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/fetch-structured-cv?uid=${applicantId}`);
        const data = await response.json();
        if (data.success) {
          setCvData(data.cvData);
        } else {
          console.error('Failed to fetch CV');
        }
      } catch (error) {
        console.error('Error fetching structured CV:', error);
      }
    };

    const fetchJobPostings = async () => {
      try {
        const user = getAuth().currentUser;
        if (!user) throw new Error('User not authenticated');

        const idToken = await user.getIdToken();
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
      } catch (error) {
        console.error('Error fetching job postings:', error);
      }
    };

    if (applicantId) {
      fetchCV();
    }
    fetchJobPostings();
  }, [applicantId]);

  if (!cvData) {
    return <p>Loading CV...</p>;
  }

  return (
    <div className="whole_page" style={{ position: 'relative' }}>
      <br /><br /><br /><br />

      <div className="Box">
        <div className="cv-edit__form-container">

          <button className="edit-jobseeker-profile__back-button" onClick={() => navigate('/dashboard-recruiter')}>
            Go Back Dashboard
          </button>

          <h2 className="cv-edit__title">Jobseeker's CV</h2>

          <br />

          <div className="upload-and-suggest">
            <label>Select Job for Suggestions:</label>
            <select
              value={selectedJobId}
              onChange={(e) => {
                const selectedId = e.target.value;
                setSelectedJobId(selectedId);
                const selectedJob = jobPostings.find(job => job.id === selectedId);
                setSelectedJobTitle(selectedJob ? selectedJob.Title : "");
              }}
              className="cv-edit__input-base"
            >
              <option value="">Select a job...</option>
              {jobPostings.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.Title}
                </option>
              ))}
            </select>
          </div>

          <br />


          {[
            { label: "Industry", key: "industry", type: "input" },
            { label: "Education", key: "education", type: "textarea" },
            { label: "Experience", key: "experience", type: "textarea" },
            { label: "Projects", key: "projects", type: "textarea" },
            { label: "Skills", key: "skills", type: "textarea" },
          ].map((field) => (
            <div key={field.key} className="cv-field" style={{ position: 'relative' }}>
              <div className="cv-field-header">
                <h2>{field.label}</h2>
                <button className="plus-button" onClick={() => toggleNote(field.key)}>➕</button>
              </div>

              {field.type === "input" ? (
                <input
                  type="text"
                  value={cvData[field.key] || "Not provided"}
                  disabled
                  className="cv-preview__input"
                />
              ) : (
                <textarea
                  disabled
                  value={cvData[field.key] || "Not provided"}
                  className="cv-preview__textarea"
                />
              )}

              {showNotes[field.key] && (
                <div className="floating-note">
                  <button className="close-note-button" onClick={() => toggleNote(field.key)}>×</button>
                  <textarea
                    placeholder={`Add notes about ${field.label}`}
                    value={notes[field.key]}
                    onChange={(e) => setNotes(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="sticky-textarea"
                  />
                </div>
              )}
            </div>
          ))}

          <br />


          <RequestCollabButton
            targetUserId={applicantId}
            cvId={applicantId}
            selectedJobId={selectedJobId}
            selectedJobTitle={selectedJobTitle}
            notes={notes}
          />


        </div>
      </div>
    </div>
  );
};

export default RecruiterPreviewCV;
