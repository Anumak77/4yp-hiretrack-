import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut, getAuth } from "firebase/auth";
import { firebaseapp } from "../components/firebaseconfigs";
import { savePdfToFirestore, fetchPdfFromFirestore } from "../components/utils";
import "../components/style.css";

const DashJobseeker = () => {
  const [name, setName] = useState("Guest");
  const [profileImage, setProfileImage] = useState(null);
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const auth = getAuth(firebaseapp);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setName(user.displayName || "Guest");
      }
    });
  }, [auth]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        window.location.href = "/login";
      })
      .catch(() => {
        console.error("Error signing out.");
      });
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImage(reader.result); // image as base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    const validTypes = ["application/pdf"];

    if (uploadedFile && validTypes.includes(uploadedFile.type)) {
      setFile(uploadedFile);
      setErrorMessage("");
      setSuccessMessage("");
    } else {
      setFile(null);
      setErrorMessage("Please upload a valid PDF file.");
    }
  };

  // Upload CV to Firestore
  const handleUploadCV = async (e) => {
    e.preventDefault();

    if (!file) {
      setErrorMessage("Please select a PDF to upload.");
      return;
    }

    try {
      await savePdfToFirestore(file);
      setSuccessMessage("CV uploaded successfully!");
    } catch (error) {
      setErrorMessage("Error uploading CV.");
    }
  };

  // View Uploaded CV
  const viewCV = async () => {
    try {
      const pdfData = await fetchPdfFromFirestore();
      if (pdfData) {
        window.open(pdfData, "_blank");
      } else {
        alert("No CV found. Please upload a CV.");
      }
    } catch (error) {
      console.error("Error fetching CV:", error);
      alert("Error fetching CV.");
    }
  };

  const appliedJobs = [
    { id: 1, title: "Software Developer" },
    { id: 2, title: "Financial Analyst" },
    { id: 3, title: "Project Manager" },
  ];

  const savedJobs = [
    { id: 4, title: "Marketing Specialist" },
    { id: 5, title: "Business Consultant" },
  ];

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="profile">
          <label htmlFor="profile-upload" className="profile__image-label">
            <div
              className="profile__image"
              style={{
                backgroundImage: profileImage ? `url(${profileImage})` : null,
              }}
            >
              {!profileImage && <span className="profile__icon">+</span>}
            </div>
          </label>
          <input
            type="file"
            id="profile-upload"
            accept="image/*"
            onChange={handleProfileImageChange}
            style={{ display: "none" }}
          />
          <p className="profile__name">{name}</p>
        </div>

        {/* CV Upload Section */}
        <div className="cv-upload-section">
          <h3>Upload Your CV</h3>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="cv-upload-input"
          />
          <button onClick={handleUploadCV} className="upload-cv-button">
            Upload CV
          </button>
          <button onClick={viewCV} className="view-cv-button">
            View CV
          </button>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}
        </div>

        <button onClick={() => (window.location.href = "/jobseekerchat")} className="logout">
          Inbox
        </button>

        <button className="logout" onClick={handleLogout}>
          Logout
        </button>
        
      </aside>

      <main className="main-content">
        <h1 className="dashboard-title">Dashboard</h1>

        <section className="job-section">
          <h2>Applied Jobs</h2>
          <div className="job-list">
            {appliedJobs.map((job) => (
              <div key={job.id} className="job-card">
                <div className="job-info">
                  <h3>{job.title}</h3>
                </div>
                <div className="job-buttons">
                  <button className="more-info">More Info</button>
                  <button className="match">Match</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="job-section">
          <h2>Saved Jobs</h2>
          <div className="job-list">
            {savedJobs.map((job) => (
              <div key={job.id} className="job-card">
                <h3>{job.title}</h3>
                <div className="job-buttons">
                  <button className="more-info">More Info</button>
                  <button className="match">Match</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashJobseeker;
