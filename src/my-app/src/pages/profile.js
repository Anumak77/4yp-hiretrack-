import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseapp } from '../components/firebaseconfigs';
import { getAuth } from 'firebase/auth';
import { savePdfToFirestore, fetchPdfFromFirestore } from '../components/utils';

const Profile = () => {
  const [name, setName] = useState('Guest');
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [cvUrl, setCvUrl] = useState('');
  const auth = getAuth(firebaseapp);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setName(user.displayName || 'Guest');
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
      style={{ height: '100vh', backgroundColor: '#f8c8dc', display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
      <section
        style={{backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0px 6px 16px rgba(200, 120, 140, 0.3)', textAlign: 'center', maxWidth: '500px', width: '100%' }} >
        <h1
          style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', color: '#ff69b4' }}>
          Hey, welcome back {name}!
        </h1>
        <p style={{ fontSize: '16px', color: '#555', marginBottom: '30px' }} >
          Please upload your CV below
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', width: '100%', cursor: 'pointer' }}
          />
          {errorMessage && (
            <p style={{ color: 'red', marginBottom: '10px' }}>{errorMessage}</p>
          )}
          {file && (
            <p style={{ color: '#555', marginBottom: '10px' }}>
              Selected file: <strong>{file.name}</strong>
            </p>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button
              type="submit"
              style={{ padding: '10px 20px', backgroundColor: '#ff69b4', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', boxShadow: '0px 4px 12px rgba(200, 120, 140, 0.3)', transition: 'background-color 0.3s ease' }}
              onMouseOver={(e) => (e.target.style.backgroundColor = '#e0559a')}
              onMouseOut={(e) => (e.target.style.backgroundColor = '#ff69b4')}
            >
              Upload CV
            </button>
            <button
              type="button"
              onClick={displayPdf}
              style={{ padding: '10px 20px', backgroundColor: '#e0e0e0', color: '#555', border: 'none', borderRadius: '8px', cursor: 'pointer', boxShadow: '0px 4px 12px rgba(200, 120, 140, 0.3)' }}
            >
              View Uploaded CV
            </button>
          </div>
        </form>

        {successMessage && (
          <p style={{ color: 'green', marginTop: '20px', fontWeight: 'bold' }}>{successMessage}</p>
        )}

        {cvUrl && (
          <div
            style={{ marginTop: '20px', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #ccc' }}
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
