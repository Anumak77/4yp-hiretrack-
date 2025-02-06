import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut, getAuth } from "firebase/auth";
import { firebaseapp } from "../components/firebaseconfigs";
import "../components/style.css";

const DashJobseeker = () => {
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

        <button className="logout" onClick={handleLogout}>Logout</button>
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
