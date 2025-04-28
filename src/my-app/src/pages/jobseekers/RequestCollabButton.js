import React, { useState } from 'react';
import { getAuth } from "firebase/auth";
import Modal from '../../components/model';

const RequestCollabButton = ({ targetUserId, cvId, selectedJobId, selectedJobTitle, notes }) => {
  const [collabRequested, setCollabRequested] = useState(false);
  const [modalInfo, setModalInfo] = useState(null);


  const handleRequestCollab = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to request collaboration");
        return;
      }
      const token = await user.getIdToken();

      const response = await fetch("http://localhost:5000/api/request-collab", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetUserId: targetUserId,
          cvId: cvId,
          selectedJobId: selectedJobId,
          selectedJobTitle: selectedJobTitle,
          notes_experience: notes.experience || "",
          notes_education: notes.education || "",
          notes_projects: notes.projects || "",
          notes_skills: notes.skills || "",
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCollabRequested(true);
        console.log("Collaboration request sent successfully!");
        setModalInfo({
          title: "Collaboration Request Sent!",
          message: "Your request has been sent successfully.",
          buttonText: "Close"
        });
      } else {
        setModalInfo({
          title: "Failed to Send Request",
          message: "Please try again later.",
          buttonText: "Close"
        });
      }
    } catch (error) {
      console.error(error);
      setModalInfo({
        title: "Error",
        message: "Something went wrong!",
        buttonText: "Close"
      });
    }
  };

  return (
    <>
      <button className='send-notes-button' onClick={handleRequestCollab}>Send Collaboration Request</button>


      {modalInfo && (
        <Modal
          title={modalInfo.title}
          message={modalInfo.message}
          buttonText={modalInfo.buttonText}
          onClose={() => setModalInfo(null)}
        />
      )}
    </>
  );
};

export default RequestCollabButton;
