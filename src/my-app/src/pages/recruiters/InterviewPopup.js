import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../components/style.css';


const InterviewPopup = ({ applicantName, jobTitle, onClose, onSchedule }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [interviewType, setInterviewType] = useState('video');
  const [notes, setNotes] = useState('');
  const [successPopup, setSuccessPopup] = useState(false);
  const [errorPopup, setErrorPopup] = useState(false);
  const [showConnectSuccess, setShowConnectSuccess] = useState(false);
  const [showConnectError, setShowConnectError] = useState(false);
  const [connectErrorMessage, setConnectErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSchedule({
        date: selectedDate,
        type: interviewType,
        notes,
      });
      setSuccessPopup(true);
        setTimeout(() => {
          setSuccessPopup(false);
          onClose(); 
        }, 20000); 

    } catch (error) {
      console.error('Error scheduling interview:', error);
      setErrorPopup(true);   
    }
  };  

  return (
<>
  {successPopup && (
    <div className="confirmation-modal">
      <div className="confirmation-content">
        Interview scheduled successfully! 
        <br></br>
        <button onClick={() => setSuccessPopup(false)} className="confirm-button">Close</button>
      </div>
    </div>
  )}

  {errorPopup && (
    <div className="confirmation-modal">
      <div className="confirmation-content">
        Sorry, we couldn't schedule the interview.
        <button onClick={() => setErrorPopup(false)} className="confirm-button reject-btn">Close</button>
      </div>
    </div>
  )}


  <div className="popup-overlay">
    <div className="interview-popup">
      <button className="close-btn" onClick={onClose}>×</button>
      <h2 className="popup-heading">Schedule Interview with {applicantName}</h2>
      <h3 className="popup-subheading">For: {jobTitle}</h3>

      <form onSubmit={handleSubmit} className="popup-form">
        <div className="connect-calendar-container">
          <button type="button" className="connect-calendar-btn">
            Connect Calendar
          </button>
        </div>

        <div className="form-group">
          <label>Date</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="dd/MM/yyyy"
            minDate={new Date()}
            className="date-picker"
          />
        </div>

        <div className="form-group">
          <label>Time</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="h:mm aa"
            className="date-picker"
          />
        </div>

        <div className="form-group">
          <label>Interview Type</label>
          <select
            value={interviewType}
            onChange={(e) => setInterviewType(e.target.value)}
            className="select-field"
          >
            <option value="video">Video Call</option>
            <option value="phone">Phone Call</option>
            <option value="in-person">In-Person</option>
          </select>
        </div>

        <div className="form-group">
          <label>Notes/Special Instructions</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="notes-field"
            placeholder="Any special instructions..."
          />
        </div>

        <div className="popup-actions">
          <button type="button" onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="schedule-btn">
            Schedule Interview
          </button>
        </div>

      </form>
    </div>
  </div>
</>
  );
};

export default InterviewPopup;
