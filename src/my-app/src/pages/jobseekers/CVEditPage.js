import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { getFirestore, doc, getDocs, collection } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firebaseapp } from "../../components/firebaseconfigs";
import RequestCollabButton from './RequestCollabButton';
import Modal from '../../components/model';


const Button = ({ children, onClick, disabled, variant = "default" }) => {
  const base = "cv-edit__button";
  const styles = {
    default: "cv-edit__button--default",
    secondary: "cv-edit__button--secondary",
    ghost: "cv-edit__button--ghost"
  };
  return (
    <button className={`${base} ${styles[variant]} ${disabled ? "cv-edit__button--disabled" : ""}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};



const Input = ({ label, value, onChange, placeholder }) => (
  <div className="mb-4">
    <label className="cv-edit__label">{label}</label>
    <input type="text" value={value} onChange={onChange} placeholder={placeholder} className="cv-edit__input-base" />
  </div>
);

const Textarea = ({ label, value, onChange, placeholder }) => (
  <div className="mb-4">
    <label className="cv-edit__label">{label}</label>
    <textarea value={value} onChange={onChange} placeholder={placeholder} className="cv-edit__textarea" />
  </div>
);

const TagInput = ({ label, value, onChange }) => {
  const [input, setInput] = useState("");
  const tags = value ? value.split(",").map(tag => tag.trim()).filter(tag => tag) : [];

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = input.trim();
      if (newTag && !tags.includes(newTag)) {
        onChange([...tags, newTag].join(", "));
      }
      setInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    onChange(updatedTags.join(", "));
  };

  return (
    <div className="mb-4">
      <label className="cv-edit__label">{label}</label>
      <div className="cv-edit__tag-input-wrapper">
        {tags.map((tag) => (
          <span key={tag} className="cv-edit__tag">
            {tag}
            <button type="button" className="cv-edit__tag-remove" onClick={() => removeTag(tag)}>×</button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type and press Enter or comma..."
          className="cv-edit__input-base cv-edit__tag-input"
        />
      </div>
    </div>
  );
};


function CVEditMock() {
  const [fileName, setFileName] = useState("");
  const [cvData, setCvData] = useState(null);
  const [cvBase64, setCvBase64] = useState("");
  const [status, setStatus] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [gptSuggestions, setGptSuggestions] = useState("");
  const [showCollabRequests, setShowCollabRequests] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    title: '',
    message: '',
    buttonText: 'Close'
  });

  const fileInputRef = useRef();
  const navigate = useNavigate();

  const handleCloseSuggestions = () => {
    setShowNote(false);
  };

  // Fetch applied jobs on mount
  useEffect(() => {
    const auth = getAuth(firebaseapp);
    const db = getFirestore(firebaseapp);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const uid = user.uid;
        const jobsRef = collection(db, `jobseekers/${uid}/appliedjobs`);
        try {
          const snapshot = await getDocs(jobsRef);
          const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setAppliedJobs(jobs);
        } catch (err) {
          console.error("Error fetching applied jobs:", err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Update selected job details
  useEffect(() => {
    const job = appliedJobs.find(j => j.id === selectedJobId);
    setSelectedJob(job || null);
  }, [selectedJobId, appliedJobs]);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setStatus("Parsing your new CV...");
    setFileName(file.name);

    const formData = new FormData();
    formData.append("file", file);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result.split(',')[1];
      setCvBase64(base64);
    };
    reader.readAsDataURL(file);

    try {
      const res = await fetch("http://localhost:5000/upload-cv", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      } else if (res.headers.get("content-type")?.includes("application/json")) {
        const data = await res.json();
        setCvData(data);
        setStatus("Uploaded and parsed your CV!");
      } else {
        const errorMsg = await res.text();
        throw new Error(`Server didn't return JSON. Returned: ${errorMsg}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setStatus(`Error parsing the file: ${error.message}`);
    }

  };


  const handleSelectRequest = async (request) => {
    const auth = getAuth(firebaseapp);
    const user = auth.currentUser;
    const token = await user.getIdToken();


    try {
      const res = await fetch('http://localhost:5000/api/fetch-collab-request-details', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requestId: request.id })
      });

      const data = await res.json();
      if (data.success) {
        console.log("FULL request details:", data.request);
        setSelectedRequest(data.request);
      } else {
        console.error("Failed to fetch full request details");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCollabRequests = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      const token = await user.getIdToken();

      const response = await fetch("http://localhost:5000/api/incoming-collab-requests", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        console.log("Fetched Collaboration Requests:", data.requests);
        setRequests(data.requests);
      } else {
        console.error('Failed to fetch collaboration requests');
      }
    } catch (error) {
      console.error('Error fetching collaboration requests', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this request?");
      if (!confirmDelete) return;

      const response = await fetch(`http://localhost:5000/api/delete-collab-request/${requestId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setRequests(requests.filter((request) => request.id !== requestId));
        alert("Request deleted successfully!");
      } else {
        alert("Failed to delete the request.");
      }
    } catch (error) {
      console.error("Error deleting the request:", error);
      alert("Error deleting the request!");
    }
  };

  const handleGetSuggestions = async () => {
    if (!selectedJob || !cvBase64) {
      alert("Please upload a CV and select a job first.");
      return;
    }

    const payload = {
      cv: cvBase64,
      jobTitle: selectedJob.Title,
      jobDescription: selectedJob.JobDescription,
      jobRequirment: selectedJob.JobRequirment
    };

    try {
      const res = await fetch("http://localhost:5000/cv-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      let suggestions = data.suggestions || "";

      suggestions = suggestions.replace(/^.*?[.!?](\s|$)/, ""); // removes first sentence

      suggestions = suggestions.replace(/\*\*(.*?)\*\*/g, "$1");

      suggestions = suggestions.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

      setGptSuggestions(suggestions);
      setShowNote(true);

    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleChange = (field, value) => {
    setCvData(prev => ({ ...prev, [field]: value }));
  };

  const handleDownload = async () => {
    const res = await fetch("http://localhost:5000/generate-cv", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cvData)
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Updated_CV.docx";
    a.click();
  };

  const showModal = (title, message) => {
    setModalData({ title, message, buttonText: 'Close' });
    setModalOpen(true);
  };


  const handleSaveCV = async () => {
    if (!cvData) {
      alert("No CV data to save!");
      return;
    }

    try {
      const auth = getAuth(firebaseapp);
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to save your CV!");
        return;
      }
      const token = await user.getIdToken();

      const response = await fetch("http://localhost:5000/api/save-structured-cv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(cvData),
      });

      const data = await response.json();
      if (data.success) {
        showModal("Success", "CV saved successfully");
      } else {
        showModal("Failed", "Failed to save CV");
      }
    } catch (error) {
      console.error(error);
      showModal("Error", "Something went wrong while saving your CV!");
    }
  };

  return (
    <div className='whole_page' style={{ position: 'relative' }}>
      <br /><br /><br /><br />

      <div className='Box'>

        {showCollabRequests && (
          <div className="collab-sidebar">
            <h3 className="collab-sidebar-title">Incoming Notes</h3>
            {loading ? (
              <p>Loading...</p>
            ) : requests.length === 0 ? (
              <p>No requests yet</p>
            ) : (
              <ul className="collab-sidebar-list">
                {requests.map((request) => (
                  <p
                    key={request.id}
                    onClick={() => handleSelectRequest(request)}
                    className="collab-sidebar-item"
                    style={{ position: "relative" }}
                  >
                    <strong>{request.job_title ? `[${request.job_title}] ` : ''}</strong>
                    {request.requester_name || request.requester_email || request.requester_id}


                    <button
                      className="delete-request-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRequest(request.id);
                      }}
                    >
                      x
                    </button>
                  </p>
                ))}
              </ul>

            )}

            {selectedRequest && (
              <div className="collab-sidebar-details">
                <h4>Suggestion from:</h4>
                <p><strong>{selectedRequest.requester_name || selectedRequest.requester_email || selectedRequest.requester_id}</strong></p>
                <p><strong>Experience:</strong> {selectedRequest.notes_experience || "No notes provided."}</p>
                <p><strong>Education:</strong> {selectedRequest.notes_education || "No notes provided."}</p>
                <p><strong>Projects:</strong> {selectedRequest.notes_projects || "No notes provided."}</p>
                <p><strong>Skills:</strong> {selectedRequest.notes_skills || "No notes provided."}</p>
              </div>
            )}
          </div>
        )}

        <div className="cv-edit__form-container">

          <button className="edit-jobseeker-profile__back-button" onClick={() => navigate(-1)}>Go Back</button>

          <h2 className="cv-edit__title">Upload & Edit Your CV</h2>

          <br>
          </br>

          <div className="upload-and-suggest">
            <input type="file" ref={fileInputRef} onChange={handleUpload} />

            <Button
              onClick={handleGetSuggestions}
              disabled={!cvBase64}
            >
              Get Suggestions to Improve!
            </Button>

            <Button variant="secondary" onClick={() => { setShowCollabRequests(!showCollabRequests); fetchCollabRequests(); }}>
              {showCollabRequests ? 'Close Notes' : 'View Notes'}
            </Button>
          </div>

          <div className="mb-4">
            <label className="cv-edit__label">Pick a Job for Suggestions</label>
            <select value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)} className="cv-edit__input-base">
              <option value="">Select a job...</option>
              {appliedJobs.map((job) => (
                <option key={job.id} value={job.id}>{job.Title || job.id}</option>
              ))}
            </select>
          </div>



          {showNote && gptSuggestions && (
            <div className="cv-suggestion-slider-container">
              <div className="cv-suggestion-slider-header">
                <h3 className="cv-suggestion-slider__title">Suggestions to Improve</h3>
                <button className="cv-suggestion-close" onClick={handleCloseSuggestions}>×</button>
              </div>
              <div className="cv-suggestion-slider">
                {gptSuggestions
                  .split(/\n(?=\d+\.)/)
                  .map((tip, i) => (
                    <div key={i} className="cv-suggestion-card">
                      <p>{tip.replace(/^\d+\.\s*/, "").trim()}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}
          <br>
          </br>

          <label className="cv-edit__file-info">{fileName && `Uploaded: ${fileName}`}</label>
          {status && <p className="cv-edit__status-message">{status}</p>}

          {cvData && (
            <div className="cv-edit__form-section">
              <Input label="Name" value={cvData.name || ""} onChange={(e) => handleChange("name", e.target.value)} />
              <Input label="Location" value={cvData.location || ""} onChange={(e) => handleChange("location", e.target.value)} />
              <Input label="Industry" value={cvData.industry || ""} onChange={(e) => handleChange("industry", e.target.value)} />
              <Textarea label="Education" value={cvData.education || ""} onChange={(e) => handleChange("education", e.target.value)} />
              <Textarea label="Experience" value={cvData.experience || ""} onChange={(e) => handleChange("experience", e.target.value)} />
              <Textarea label="Projects" value={cvData.projects || ""} onChange={(e) => handleChange("projects", e.target.value)} />
              <TagInput label="Skills" value={cvData.skills || ""} onChange={(val) => handleChange("skills", val)} />
              <div className="downloadcv">
                <Button variant="secondary" onClick={handleDownload}>Download CV</Button>
              </div>

              <Button variant="secondary" onClick={handleSaveCV}>
                Save CV
              </Button>
            </div>
          )}

        </div>


      </div>

      {modalOpen && (
        <Modal
          title={modalData.title}
          message={modalData.message}
          buttonText={modalData.buttonText}
          onClose={() => setModalOpen(false)}
        />
      )}

    </div>
  );
}

export default CVEditMock;
