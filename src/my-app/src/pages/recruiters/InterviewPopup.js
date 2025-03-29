import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
//import '/interview-popup.css'; 

const InterviewPopup = ({ applicantName, jobTitle, onClose, onSchedule }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [interviewType, setInterviewType] = useState('video');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSchedule({
      date: selectedDate,
      type: interviewType,
      notes
    });
  };

  return (
    <div className="popup-overlay">
      <div className="interview-popup">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Schedule Interview with {applicantName}</h2>
        <h3>For: {jobTitle}</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Date & Time:</label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              minDate={new Date()}
            />
          </div>
          
          <div className="form-group">
            <label>Interview Type:</label>
            <select 
              value={interviewType} 
              onChange={(e) => setInterviewType(e.target.value)}
            >
              <option value="video">Video Call</option>
              <option value="phone">Phone Call</option>
              <option value="in-person">In-Person</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Notes:</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions..."
            />
          </div>
          
          <div className="popup-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Schedule Interview</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterviewPopup;