import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { analyzeSimilarity, savePdfToFirestore, fetchPdfFromFirestore } from "../components/utils";
import { Document, Page, pdfjs } from "react-pdf";
import { jsPDF } from "jspdf";
import { saveAs } from "file-saver";
import * as pdfjsLib from "pdfjs-dist/webpack";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { firebaseapp } from "../components/firebaseconfigs";
import { getAuth } from "firebase/auth";
import "../components/style.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

const DashJobseeker = () => {
  const [jobDescriptions] = useState([
    "Design and develop scalable web applications",
    "Manage financial reports and forecasts",
    "Coordinate cross-functional teams for project execution",
  ]);
  const [similarityScores, setSimilarityScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("Guest");
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

  const fetchSimilarityScores = async () => {
    setLoading(true);
    setError("");
    try {
      const scores = [];
      for (const description of jobDescriptions) {
        const score = await analyzeSimilarity(description);
        scores.push({ description, score });
      }
      setSimilarityScores(scores);
    } catch (err) {
      setError("Failed to fetch similarity scores. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmitofFileChange = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage("Please select a PDF to upload.");
      return;
    }

    try {
      await savePdfToFirestore(file);
      setSuccessMessage("PDF uploaded successfully!");
    } catch (error) {
      setErrorMessage("Error uploading PDF.");
    }
  };

  const displayPdf = async () => {
    const pdfData = await fetchPdfFromFirestore();
    const pdfWindow = window.open();
    pdfWindow.document.write(`<iframe width="100%" height="100%" src="${pdfData}"></iframe>`);
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        window.location.href = "/login";
      })
      .catch(() => {
        setErrorMessage("Error signing out.");
      });
  };

  return (
    <div className="dashboard__container">
      <h1>Hey, welcome back {name}!</h1>
      <p>Please upload your CV below</p>

      <form onSubmit={handleSubmitofFileChange} className="profile__form">
        <input type="file" accept=".pdf" onChange={handleFileChange} />
        {errorMessage && <p className="profile__error">{errorMessage}</p>}
        {file && <p className="profile__selected">Selected file: <strong>{file.name}</strong></p>}

        <div className="profile__buttons">
          <button type="submit">Upload CV</button>
          <button type="button" onClick={displayPdf}>View Uploaded CV</button>
        </div>
      </form>

      {successMessage && <p className="profile__success">{successMessage}</p>}

      <button className="profile__logout" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default DashJobseeker;