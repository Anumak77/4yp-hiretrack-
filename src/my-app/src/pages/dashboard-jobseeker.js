import React, { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { jsPDF } from "jspdf";
import { saveAs } from "file-saver";
import * as pdfjsLib from "pdfjs-dist/webpack";
import pdfWorker from "pdfjs-dist/build/pdf.worker.entry"; // Fix the worker issue

// Set workerSrc to load from a CDN


// Correct way to set workerSrc
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();


const DashJobseeker = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [textItems, setTextItems] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTexts, setEditedTexts] = useState({});
  const pdfContainerRef = useRef(null);

  // Handle PDF upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(URL.createObjectURL(file));
      extractTextFromPDF(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  // Extract text with positions
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
            x: item.transform[4], // X position
            y: item.transform[5], // Y position
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

  // Handle text editing
  const handleTextChange = (index, event) => {
    setEditedTexts({ ...editedTexts, [index]: event.target.innerText });
  };

  const handleDownload = () => {
    const pdf = new jsPDF();
    pdf.setFontSize(14); // Increase font size for better readability
  
    let yPosition = 20; // Start further down
    textItems.forEach((item, index) => {
      const newText = editedTexts[index] || item.text;
      pdf.text(newText, item.x * 0.75, yPosition); // Adjusted scaling
      yPosition += 10; // Extra spacing to prevent compacting
    });
  
    const pdfBlob = pdf.output("blob");
    saveAs(pdfBlob, "Updated_CV.pdf");
  };
  

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h3>Edit Your CV (Preserving Format)</h3>

      {/* Upload PDF */}
      <input type="file" accept=".pdf" onChange={handleFileUpload} />

      {/* Display PDF */}
      <div
        ref={pdfContainerRef}
        style={{
          position: "relative",
          display: "inline-block",
          marginTop: "20px",
        }}
      >
        {pdfFile && (
          <Document
            file={pdfFile}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          >
            {Array.from(new Array(numPages), (el, index) => (
              <Page key={index} pageNumber={index + 1} />
            ))}
          </Document>
        )}

        {/* Editable Text Overlays */}
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

      {/* Download Edited PDF */}
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
