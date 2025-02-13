import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut, getAuth } from "firebase/auth";
import { firebaseapp } from "../../components/firebaseconfigs";
import { savePdfToFirestore, fetchPdfFromFirestore } from "../../components/utils";
import "../../components/style.css";

const DashJobseeker = () => {
  // ================= Auth / Profile =================
  const [name, setName] = useState("Guest");
  const [profileImage, setProfileImage] = useState(null);
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
      .catch(() => console.error("Error signing out."));
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // ================= CV Upload =================
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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

  // ================= DRAG AND DROP STATES =================
  //"Offered" separate and NOT included in drag & drop.
  const [jobColumns, setJobColumns] = useState({
    saved: [
      { id: 1, title: "Front-End Developer" },
      { id: 2, title: "Data Analyst" },
      { id: 3, title: "Business Analyst" },
    ],
    interviewed: [
      { id: 4, title: "Software Developer" },
      { id: 5, title: "Back-End Developer" },
    ],
    applied: [
      { id: 6, title: "Quality Assurance Engineer" },
      { id: 7, title: "Scrum Master" },
    ],
    unapply: [
      { id: 8, title: "Product Owner" },
      { id: 9, title: "Solutions Architect" },
      { id: 10, title: "DevOps Engineer" },
    ],
  });

  // Offered jobs (non-draggable)
  const [offeredJobs] = useState([
    { id: 11, title: "Marketing Specialist" },
    { id: 12, title: "Project Manager" },
  ]);

  // Drag & Drop Handlers
  const handleDragStart = (e, job, sourceColumn) => {
    // Attach job data to the drag event
    e.dataTransfer.setData("jobData", JSON.stringify({ job, sourceColumn }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetColumn) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("jobData");
    if (data) {
      const { job, sourceColumn } = JSON.parse(data);
      if (sourceColumn === targetColumn) return; // No change if same column

      setJobColumns((prev) => {
        // Remove from source
        const sourceJobs = prev[sourceColumn].filter((j) => j.id !== job.id);
        // Add to target
        const targetJobs = [...prev[targetColumn], job];
        return {
          ...prev,
          [sourceColumn]: sourceJobs,
          [targetColumn]: targetJobs,
        };
      });
    }
  };

  return (
    <div className="dash-jobseeker__container">
      {/* =============== SIDEBAR =============== */}
      <aside className="dash-jobseeker__sidebar">
        <div className="dash-jobseeker__profile">
          <label
            htmlFor="profile-upload"
            className="dash-jobseeker__profile-image-label"
          >
            <div
              className="dash-jobseeker__profile-image"
              style={{
                backgroundImage: profileImage ? `url(${profileImage})` : "none",
              }}
            >
              {!profileImage && (
                <span className="dash-jobseeker__profile-icon">+</span>
              )}
            </div>
          </label>
          <input
            type="file"
            id="profile-upload"
            accept="image/*"
            onChange={handleProfileImageChange}
            style={{ display: "none" }}
          />
          <p className="dash-jobseeker__profile-name">{name}</p>
        </div>

        {/* CV Section */}
        <div className="dash-jobseeker__cv-section">

          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="dash-jobseeker__input"
          />
          <button onClick={handleUploadCV} className="dash-jobseeker__button">
            Upload CV
          </button>
          <button onClick={viewCV} className="dash-jobseeker__button">
            View CV
          </button>
          {errorMessage && (
            <p className="dash-jobseeker__error-message">{errorMessage}</p>
          )}
          {successMessage && (
            <p className="dash-jobseeker__success-message">{successMessage}</p>
          )}
        </div>

        <button
          onClick={() => (window.location.href = "/jobseekerchat")}
          className="dash-jobseeker__button"
        >
          Inbox
        </button>

        <button className="dash-jobseeker__logout" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      {/* =============== MAIN CONTENT =============== */}
      <main className="dash-jobseeker__main">
        <h1 className="dash-jobseeker__title">Dashboard</h1>

        {/* Four Columns in a 2x2 Grid (SAVED, INTERVIEWED, APPLIED, UNAPPLY) */}
        <div className="dash-jobseeker__drag-area">
          {/* ======== Saved ======== */}
          <div
            className="dash-jobseeker__column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "saved")}
          >
            <h2 className="dash-jobseeker__column-title">Saved</h2>
            <div className="dash-jobseeker__job-list">
              {jobColumns.saved.map((job) => (
                <div
                  key={job.id}
                  className="dash-jobseeker__job-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, job, "saved")}
                >
                  <div className="dash-jobseeker__job-info">
                    <h3>{job.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ======== Interviewed ======== */}
          <div
            className="dash-jobseeker__column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "interviewed")}
          >
            <h2 className="dash-jobseeker__column-title">Interviewed</h2>
            <div className="dash-jobseeker__job-list">
              {jobColumns.interviewed.map((job) => (
                <div
                  key={job.id}
                  className="dash-jobseeker__job-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, job, "interviewed")}
                >
                  <div className="dash-jobseeker__job-info">
                    <h3>{job.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ======== Applied (Bottom Left) ======== */}
          <div
            className="dash-jobseeker__column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "applied")}
          >
            <h2 className="dash-jobseeker__column-title">Applied</h2>
            <div className="dash-jobseeker__job-list">
              {jobColumns.applied.map((job) => (
                <div
                  key={job.id}
                  className="dash-jobseeker__job-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, job, "applied")}
                >
                  <div className="dash-jobseeker__job-info">
                    <h3>{job.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ======== Unapply (Bottom Right) ======== */}
          <div
            className="dash-jobseeker__column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "unapply")}
          >
            <h2 className="dash-jobseeker__column-title">Withdrawn</h2>
            <div className="dash-jobseeker__job-list">
              {jobColumns.unapply.map((job) => (
                <div
                  key={job.id}
                  className="dash-jobseeker__job-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, job, "unapply")}
                >
                  <div className="dash-jobseeker__job-info">
                    <h3>{job.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ======== Offered (NOT draggable) ======== */}
        <div className="dash-jobseeker__offered-column">
          <h2 className="dash-jobseeker__offered-title">Offered</h2>
          <div className="dash-jobseeker__job-list">
            {offeredJobs.map((job) => (
              <div key={job.id} className="dash-jobseeker__job-card">
                <div className="dash-jobseeker__job-info">
                  <h3>{job.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashJobseeker;
