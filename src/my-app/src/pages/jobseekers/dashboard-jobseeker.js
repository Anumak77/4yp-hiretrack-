import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut, getAuth } from "firebase/auth";
import { firebaseapp } from "../../components/firebaseconfigs";
import "../../components/style.css";
import NavbarJobseeker from './NavbarJobseeker';
// import axios from 'axios';
import { getFirestore, collection, query, orderBy, onSnapshot } from "firebase/firestore";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const DashJobseeker = () => {
  // Auth / Profile
  const [name, setName] = useState("Guest");
  const [profileImage, setProfileImage] = useState(null);
  const auth = getAuth(firebaseapp);
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) setName(user.displayName || "Guest");
    });
  }, [auth]);

  const logIdToken = async () => {
    try {
      const user = getAuth().currentUser; 
      if (!user) {
        console.log('No user is currently signed in.');
        return;
      }  
      // Get the Firebase ID token
      const idToken = await user.getIdToken();
      console.log('Firebase ID Token:', idToken); 
    } catch (error) {
      console.error('Error fetching ID token:', error);
    }
  };

  logIdToken();

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
      const user = auth.currentUser;
      if (!user) {
        console.log("No user is currently signed in.");
        return;
      }
      const idToken = await user.getIdToken();

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64File = reader.result.split(",")[1];

        const response = await fetch("http://127.0.0.1:5000/save-pdf", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: idToken,
          },
          body: JSON.stringify({ file: base64File }),
        });

        if (response.ok) {
          setSuccessMessage("CV uploaded successfully!");
        } else {
          setErrorMessage("Error uploading CV.");
        }
      };
    } catch (error) {
      console.error("Error uploading CV:", error);
      setErrorMessage("Error uploading CV.");
    }
  };

  const viewCV = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return alert("No user is signed in.");

      const idToken = await user.getIdToken();

      const response = await fetch("http://127.0.0.1:5000/fetch-pdf", {
        method: "GET",
        headers: { Authorization: idToken },
      });

      if (!response.ok) {
        throw new Error("Could not fetch PDF");
      }
      const data = await response.json();

      if (data.fileData) {
        const byteCharacters = atob(data.fileData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });

        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
        URL.revokeObjectURL(blobUrl);
      } else {
        alert("No CV found. Please upload a CV.");
      }
    } catch (error) {
      console.error("Error fetching CV:", error);
      alert("Error fetching CV.");
    }
  };



  // ================= DRAG AND DROP STATES =================
  const [jobColumns, setJobColumns] = useState({
    saved: [],
    applied: [],
    unapply: [],
  });

  const [offeredJobs, setOfferedJobs] = useState([]);
  const [interviewJobs, setInterviewJobs] = useState([]);

  const fetchJobs = async (jobList) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("User is not authenticated");
        return [];
      }
      const idToken = await user.getIdToken();

      const response = await fetch(`http://127.0.0.1:5000/fetch-jobseeker-jobs/${jobList}`, {
        headers: { Authorization: idToken },
      });

      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } else {
        console.error(`Error fetching ${jobList} jobs:`, response.statusText);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching ${jobList} jobs:`, error);
      return [];
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const loadJobs = async () => {
          const savedJobs = await fetchJobs("savedjobs");
          const appliedJobs = await fetchJobs("appliedjobs");
          const interviewedJobs = await fetchJobs("interviewedjobs");
          const unapplyJobs = await fetchJobs("unapplyjobs");
          const offeredJobs = await fetchJobs("offeredjobs");
  
          setJobColumns({ saved: savedJobs, applied: appliedJobs, unapply: unapplyJobs });
          setInterviewJobs(interviewedJobs);
          setOfferedJobs(offeredJobs);
        };
        loadJobs();
      } else {
        console.error("User is not authenticated");
      }
    });
    return () => unsubscribe();
  }, [auth]);

  // Drag & Drop Handlers
  const handleDragStart = (e, job, sourceColumn) => {
    // Attach job data to the drag event
    e.dataTransfer.setData("jobData", JSON.stringify({ job, sourceColumn }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const columnToCollectionMap = {
    saved: "savedjobs",       
    applied: "appliedjobs",   
    interviewed: "interviewedjobs", 
    withdraw: "unapplyjobs",  
    offered: "offeredjobs",
  };

  const handleDrop = async (e, targetColumn) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("jobData");
    if (!data) return;

    const { job, sourceColumn } = JSON.parse(data);
    if (sourceColumn === targetColumn) return; // no-op if same column

    // update local state first (optimistic)
    setJobColumns((prev) => {
      const sourceJobs = prev[sourceColumn] ? prev[sourceColumn].filter((j) => j.id !== job.id): [];
      const targetJobs = prev[targetColumn] ? [...prev[targetColumn], job] : [job];
      return {
        ...prev,
        [sourceColumn]: sourceJobs,
        [targetColumn]: targetJobs,
      };
    });

    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("User is not authenticated");
        return;
      }
      const idToken = await user.getIdToken();

      const sourceCollection = columnToCollectionMap[sourceColumn];
      const targetCollection = columnToCollectionMap[targetColumn];

      await fetch("http://localhost:5000/move-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: idToken,
        },
        body: JSON.stringify({
          job_id: job.id,
          source_collection: sourceCollection,
          target_collection: targetCollection,
        }),
      });
      console.log("Job moved successfully");
    } catch (error) {
      console.error("Error moving job:", error);
      // revert local state if needed
    }
  };


  const handleMoreInfoClick = (job) => {
    navigate("/job-details2", { state: job });
  };

  const listenForNotifications = () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        throw new Error("User not authenticated");
    }

    const db = getFirestore();
    const notificationsRef = collection(db, `jobseekers/${user.uid}/notifications`);
    const q = query(notificationsRef, orderBy("timestamp", "desc")); 

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        querySnapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                const notification = change.doc.data();
                toast.info(notification.message); 
            }
        });
    });

    return unsubscribe; 
};

useEffect(() => {
    const unsubscribe = listenForNotifications();

    return () => unsubscribe();
}, []);

  return (
    <div className="dash-jobseeker__container">
      <NavbarJobseeker />
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
                    <h3>{job.Title}</h3>
                    <button
                    className="more-info-button"
                    onClick={() => handleMoreInfoClick(job)}
                  >
                    More Info
                  </button>
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
              {interviewJobs.map((job) => (
                <div
                  key={job.id}
                  className="dash-jobseeker__job-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, job, "interviewed")}
                >
                  <div className="dash-jobseeker__job-info">
                    <h3>{job.Title}</h3>
                    <button
                    className="more-info-button"
                    onClick={() => handleMoreInfoClick(job)}
                  >
                    More Info
                  </button>
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
                    <h3>{job.Title}</h3>
                    <button
                    className="more-info-button"
                    onClick={() => handleMoreInfoClick(job)}
                  >
                    More Info
                  </button>
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
                    <h3>{job.Title}</h3>
                    <button
                    className="more-info-button"
                    onClick={() => handleMoreInfoClick(job)}
                  >
                    More Info
                  </button>
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
                  <button
                    className="more-info-button"
                    onClick={() => handleMoreInfoClick(job)}
                  >
                    More Info
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default DashJobseeker;
