import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseapp } from '../components/firebaseconfigs';
import { getAuth } from 'firebase/auth';
import { convertToBase64 } from '../components/utils';
import { savePdfToFirestore } from '../components/utils';
import { fetchPdfFromFirestore } from '../components/utils';

const Profile = () => {
  const [name, setName] = useState('Guest'); // Default to "Guest" if no name is available
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cvUrl, setCvUrl] = useState(''); // To store the uploaded file's download URL
  const auth = getAuth(firebaseapp);

  useEffect(() => {
    // Fetch the user's name from Firebase Auth
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setName(user.displayName || 'Guest'); // Use displayName if available
      }
    });
  }, []);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    const validTypes = ['application/pdf'];

    if (uploadedFile && validTypes.includes(uploadedFile.type)) {
      setFile(uploadedFile);
      setErrorMessage('');
      setSuccessMessage('');
    } else {
      setFile(null);
      setErrorMessage('Please upload a valid PDF file.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setErrorMessage('Please select a PDF to upload.');
      return;
    }

    try {
      await savePdfToFirestore(file);
      setSuccessMessage('PDF uploaded successfully!');
    } catch (error) {
      setErrorMessage('Error uploading PDF.');
    }
  };

  const displayPdf = async () => {
    const pdfData = await fetchPdfFromFirestore();
    const pdfWindow = window.open();
    pdfWindow.document.write(`<iframe width='100%' height='100%' src="${pdfData}"></iframe>`);
  };
  

  return (
    <main
      style={{
        height: '100vh',
        backgroundColor: '#f8c8dc', // Light pink background
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <section
        style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '8px',
          boxShadow: '0px 4px 12px rgba(200, 120, 140, 0.3)', // Pink-themed shadow
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%',
        }}
      >
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '20px',
            color: '#ff69b4', // Pink text color
          }}
        >
          Hey, welcome back {name}!
        </h1>
        <p
          style={{
            fontSize: '16px',
            color: '#555',
            marginBottom: '30px',
          }}
        >
          Please upload your CV below
        </p>

        {/* CV Upload Section */}
        <form onSubmit={handleSubmit}>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            style={{
              marginBottom: '15px',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              width: '100%',
            }}
          />
          {errorMessage && (
            <p style={{ color: 'red', marginBottom: '10px' }}>{errorMessage}</p>
          )}
          {file && (
            <p style={{ color: '#555', marginBottom: '10px' }}>
              Selected file: {file.name}
            </p>
          )}
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              backgroundColor: '#ff69b4', // Pink button background
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              boxShadow: '0px 4px 8px rgba(200, 120, 140, 0.3)', // Pink shadow
              marginTop: '10px',
            }}
          >
            Upload CV
          </button>
          <button onClick={displayPdf}>View Uploaded CV</button>
        </form>

        {uploadProgress > 0 && (
          <p style={{ marginTop: '10px', color: '#555' }}>
            Upload Progress: {uploadProgress}%
          </p>
        )}
        {successMessage && (
          <p style={{ color: 'green', marginTop: '10px' }}>{successMessage}</p>
        )}
        {cvUrl && (
          <div
            style={{
              marginTop: '20px',
              backgroundColor: '#f9f9f9',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #ccc',
            }}
          >
            <p style={{ margin: '0' }}>
              <strong>Download your CV:</strong>{' '}
              <a href={cvUrl} target="_blank" rel="noopener noreferrer">
                {file.name}
              </a>
            </p>
          </div>
        )}
      </section>
    </main>
  );
};

export default Profile;
