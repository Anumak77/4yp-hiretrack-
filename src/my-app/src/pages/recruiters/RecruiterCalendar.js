import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import googleCalendarPlugin from '@fullcalendar/google-calendar';
import { useGoogleLogin } from '@react-oauth/google';
import { getAuth } from 'firebase/auth';
import '../../components/style.css';

const RecruiterCalendar = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [error, setError] = useState(null);
  const auth = getAuth();

  const connectCalendar = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('Not authenticated');
  
        console.log("Google OAuth Response:", tokenResponse);
  
        const payload = {
          uid: user.uid,
          token: tokenResponse.access_token
        };
        console.log("Sending payload to backend:", JSON.stringify(payload, null, 2));
        
        const response = await fetch('http://localhost:5000/store-google-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': await user.getIdToken()
          },
          body: JSON.stringify(payload) 
        });
  
        const responseClone = response.clone();
        const data = await response.json();
        
        if (!response.ok) {
          throw { 
            message: data.error || 'Failed to store token',
            response: responseClone
          };
        }
  
        alert('Google Calendar connected successfully!');
      } catch (error) {
        console.error('Full error:', error);
        
        let errorDetails = '';
        try {
          const errorResponse = error.response || await fetch(error.url);
          errorDetails = await errorResponse.text();
        } catch (e) {
          errorDetails = error.message;
        }
        
        console.error('Error details:', errorDetails);
        alert(`Connection failed: ${error.message}\nDetails: ${errorDetails.substring(0, 100)}`);
      }
    },
    scope: 'https://www.googleapis.com/auth/calendar.events',
    flow: 'implicit',
    prompt: 'consent'
  });

  const fetchCalendarEvents = () => {
    console.log("fetching calendar events")
  }
  useEffect(() => {
    const checkCalendarConnection = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          fetchCalendarEvents();
        }
      } catch (err) {
        console.error('Initial connection check failed:', err);
      }
    };
    
    checkCalendarConnection();
  }, []);

  if (isLoading) return <div className="loading">Loading calendar data...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="calendar-container" style={{ padding: '20px' }}>
      <h1>Recruiter Calendar</h1>
      
      {!calendarConnected && (
        <div className="connect-prompt">
          <p>Connect your Google Calendar to view and manage events</p>
          <button 
            onClick={connectCalendar} 
            className="connect-button"
            disabled={isLoading}
          >
            {isLoading ? 'Connecting...' : 'Connect Google Calendar'}
          </button>
        </div>
      )}

      {calendarConnected && (
        <FullCalendar
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            googleCalendarPlugin
          ]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          height="auto"
          events={events.map(event => ({
            id: event.id,
            title: event.summary,
            start: event.start.dateTime || event.start.date,
            end: event.end.dateTime || event.end.date,
            description: event.description,
            location: event.location,
            backgroundColor: event.colorId ? getEventColor(event.colorId) : '#3788d8'
          }))}
          eventClick={(info) => {
            alert(
              `Event: ${info.event.title}\n` +
              `Start: ${info.event.start}\n` +
              `End: ${info.event.end}\n` +
              `Description: ${info.event.extendedProps.description || 'No description'}`
            );
          }}
          nowIndicator={true}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
        />
      )}
    </div>
  );
};

// Helper function to map Google Calendar color IDs to hex colors
function getEventColor(colorId) {
  const colorMap = {
    '1': '#a4bdfc',
    '2': '#7ae7bf',
    '3': '#dbadff',
    '4': '#ff887c',
    '5': '#fbd75b',
    '6': '#ffb878',
    '7': '#46d6db',
    '8': '#e1e1e1',
    '9': '#5484ed',
    '10': '#51b749',
    '11': '#dc2127'
  };
  return colorMap[colorId] || '#3788d8';
}

export default RecruiterCalendar;