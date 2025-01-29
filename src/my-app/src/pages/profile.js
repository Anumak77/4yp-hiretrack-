import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { firebaseapp } from '../components/firebaseconfigs';
import { getAuth } from 'firebase/auth';
import { savePdfToFirestore, fetchPdfFromFirestore } from '../components/utils';
import '../components/style.css'; 


const Profile = () => {
  const [name, setName] = useState('Guest');
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const auth = getAuth(firebaseapp);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setName(user.displayName || 'Guest');
      }
    });
  }, [auth]);

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

  const handleSubmitofFileChange = async (e) => {
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
    pdfWindow.document.write(`<iframe width="100%" height="100%" src="${pdfData}"></iframe>`);
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        window.location.href = '/login';
      })
      .catch(() => {
        setErrorMessage('Error signing out.');
      });
  };

  return (
    <main className="profile__container">
      <section className="profile__card">
        <h1 className="profile__title">Hey, welcome back {name}!</h1>
        <p className="profile__subtitle">Please upload your CV below</p>

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
      </section>

      <button className="profile__logout" onClick={handleLogout}>Logout</button>
    </main>
  );
};

export default Profile;
