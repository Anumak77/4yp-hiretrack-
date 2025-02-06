import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { analyzeSimilarity } from "../components/utils";
import { Document, Page, pdfjs } from "react-pdf";
import { jsPDF } from "jspdf";
import { saveAs } from "file-saver";
import * as pdfjsLib from "pdfjs-dist/webpack";
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

  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [textItems, setTextItems] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTexts, setEditedTexts] = useState({});
  const pdfContainerRef = useRef(null);
/*
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
*/
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(URL.createObjectURL(file));
      extractTextFromPDF(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const extractTextFromPDF = async (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const typedArray = new Uint8Array(e.target.result);
      const pdf = await pdfjsLib.getDocument(typedArray).promise;
      let extractedTextItems = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        textContent.items.forEach((item) => {
          extractedTextItems.push({
            text: item.str,
            x: item.transform[4],
            y: item.transform[5],
            width: item.width,
            height: item.height,
            page: i,
          });
        });
      }

      setTextItems(extractedTextItems);
      setIsEditing(true);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleTextChange = (index, event) => {
    setEditedTexts({ ...editedTexts, [index]: event.target.innerText });
  };

  const handleDownload = () => {
    const pdf = new jsPDF();
    pdf.setFontSize(14);

    let yPosition = 20;
    textItems.forEach((item, index) => {
      const newText = editedTexts[index] || item.text;
      pdf.text(newText, item.x * 0.75, yPosition);
      yPosition += 10;
    });

    const pdfBlob = pdf.output("blob");
    saveAs(pdfBlob, "Updated_CV.pdf");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px" }}>
      <div style={{ display: "flex", width: "100%", marginTop: "20px" }}>
        <div style={{ width: "20%", borderRight: "1px solid #ddd", padding: "20px" }}>
          <Link to="/profile" style={{ textDecoration: "none", color: "#007bff" }}>
            Go to Profile
          </Link>
        </div>

        <div style={{ flexGrow: 1, padding: "20px" }}>
          <h3>Job Match Scores</h3>
          <div style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {similarityScores.length > 0 && (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#ff69b4", color: "white" }}>
                    <th style={{ padding: "10px", border: "1px solid #ddd" }}>Job Description</th>
                    <th style={{ padding: "10px", border: "1px solid #ddd" }}>Match Score (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {similarityScores.map((item, index) => (
                    <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff" }}>
                      <td style={{ padding: "10px", border: "1px solid #ddd" }}>{item.description}</td>
                      <td style={{ padding: "10px", border: "1px solid #ddd" }}>{(item.score * 100).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ marginTop: "30px", textAlign: "center" }}>
            <h3>Edit Your CV</h3>
            <input type="file" accept=".pdf" onChange={handleFileUpload} />

            <div ref={pdfContainerRef} style={{ position: "relative", display: "inline-block", marginTop: "20px" }}>
              {pdfFile && (
                <Document file={pdfFile} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                  {Array.from(new Array(numPages), (el, index) => (
                    <Page key={index} pageNumber={index + 1} />
                  ))}
                </Document>
              )}

              {isEditing &&
                textItems.map((item, index) => (
                  <div
                    key={index}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(event) => handleTextChange(index, event)}
                    style={{
                      position: "absolute",
                      left: `${item.x}px`,
                      top: `${item.y}px`,
                      width: `${item.width}px`,
                      height: `${item.height}px`,
                      background: "rgba(255, 255, 255, 0.7)",
                      fontSize: "12px",
                      padding: "2px",
                      border: "1px solid #ccc",
                      cursor: "text",
                    }}
                  >
                    {editedTexts[index] || item.text}
                  </div>
                ))}
            </div>

            {isEditing && (
              <button onClick={handleDownload} style={{ marginTop: "20px", padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", cursor: "pointer" }}>
                Download Updated CV
              </button>
            )}
          </div>
        </div>
      </div>

      {isEditing && (
        <button
          onClick={handleDownload}
          style={{
            marginTop: "20px",
            padding: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Download Updated CV
        </button>
      )}
    </div>
  );
};

export default DashJobseeker;

