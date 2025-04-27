import { getAuth } from "firebase/auth";
import React, { useState, useEffect } from "react";
import "../../components/style.css";
import { useGoogleLogin } from '@react-oauth/google';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, intervalToDuration } from 'date-fns';
import "../../components/style.css";
import "../../components/cal.css";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const locales = {
  'en-US': require('date-fns/locale/en-US')
};


const RecruiterCalendar = () => {
  const [events, setEvents] = useState([]);
  const auth = getAuth();
  const user = auth.currentUser;
  const [loading, setLoading] = useState("")
  const [view, setView] = useState('week'); 
  const [height, setHeight] = useState(400);
  const [isConnected, setIsConnected] = useState(false);
  const GOOGLE_CLIENT_ID = "714625690444-bjnr3aumebso58niqna7613rtvmc5e6f.apps.googleusercontent.com"
  const GOOGLE_CLIENT_SECRET = "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"
  const [showConnectSuccess, setShowConnectSuccess] = useState(false);
  const [showConnectError, setShowConnectError] = useState(false);
  const [connectErrorMessage, setConnectErrorMessage] = useState('');



  const connectCalendar = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('Not authenticated');
  
        console.log("Google OAuth Response:", tokenResponse);

        const tokenResponseWithRefresh = await fetch(
          'https://oauth2.googleapis.com/token',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              code: tokenResponse.code, 
              client_id: GOOGLE_CLIENT_ID,
              client_secret: GOOGLE_CLIENT_SECRET,
              redirect_uri: 'http://localhost:3000', 
              grant_type: 'authorization_code',
            }),
          }
        ).then(res => res.json());
  
        const payload = {
          uid: user.uid,
          token: tokenResponseWithRefresh.access_token,
          refreshToken: tokenResponseWithRefresh.refresh_token
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
  
        setShowConnectSuccess(true);
      } catch (error) {
        setConnectErrorMessage(error.message || "Failed to connect calendar");
        setShowConnectError(true);

        
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
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    flow: 'auth-code',
    prompt: 'consent',
    access_type: 'offline',
  });

  useEffect(() => {
    if (isConnected) {
    const fetchEvents = async () => {      
      setLoading(true);

      try {
        const idToken = await user.getIdToken();

        console.log('Successfully obtained ID token:', idToken);

        const response = await fetch('http://localhost:5000/get-calendar-events', {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        });

        console.log('Response status:', response.status, response.statusText);
        
        if (!response.ok) throw new Error('Failed to fetch events');
        
        const data = await response.json();

        console.log(data)

        const sourceArray = Array.isArray(data) 
          ? data 
          : data?.items && Array.isArray(data.items) 
            ? data.items 
            : null;

        if (!sourceArray) {
          console.warn('Unexpected data format from backend:', data);
          throw new Error('Invalid events data format');
        }

        const formattedEvents = sourceArray.map(event => {
          try {
            return {
              id: event.id || Math.random().toString(36).substring(2, 9),
              title: event.summary || event.title || 'No Title',
              start: new Date(event.start?.dateTime || event.start?.date || new Date()),
              end: new Date(event.end?.dateTime || event.end?.date || new Date(Date.now() + 3600000)),
              allDay: !event.start?.dateTime,
            };
          } catch (e) {
            console.error('Error processing event:', event, e);
            return null; 
          }
        }).filter(Boolean);
        
        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchEvents();}
  }, [user, isConnected]); 
  
  useEffect(() => {
    const checkConnection = async () => {
      const userDoc = await getDoc(doc(getFirestore(), 'users', user.uid));
      setIsConnected(!!userDoc.data()?.googleTokens?.accessToken);
    };
    if (user) checkConnection();
  }, [user]);
  
  useEffect(() => {
    setHeight(view === 'month' ? 600 : view === 'week' ? 500 : 400);
  }, [view]);
  

  const CustomEvent = ({ event }) => (
    <div>
    <strong>{event?.title || "undefined"}</strong>
        {event?.resource?.description && event.resource.description !== "undefined" && (
          <div>{event.resource.description}</div>
        )}  
    </div>
  );
  
  const CustomToolbar = (toolbar) => {
    const goToToday = () => {
      toolbar.onNavigate('TODAY');
    };
  
    return (
      <div className="rbc-toolbar">
        <span className="rbc-btn-group">
          <button onClick={() => toolbar.onView('day')}>Day</button>
          <button onClick={() => toolbar.onView('week')}>Week</button>
          <button onClick={() => toolbar.onView('month')}>Month</button>
        </span>
        <span className="rbc-toolbar-label">{toolbar.label}</span>
        <span className="rbc-btn-group">
          <button onClick={goToToday}>Today</button>
        </span>
      </div>
    );
  };


  const CalendarTableView = ({ events }) => {
    const eventsByDate = events.reduce((acc, event) => {
      const dateKey = format(event.start, 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(event);
      return acc;
    }, {});
  
    const sortedDates = Object.keys(eventsByDate).sort();
  
    return (
      <div className="calendar-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Event</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {sortedDates.map(date => (
              eventsByDate[date].map((event, index) => (
                <tr key={`${date}-${index}`}>
                  <td>{index === 0 ? format(new Date(date), 'MMM do, yyyy') : ''}</td>
                  <td>{format(event.start, 'h:mm a')}</td>
                  <td>{event.title}</td>
                  <td>
                    {formatDuration(
                      intervalToDuration({
                        start: event.start,
                        end: event.end
                      })
                    )}
                  </td>
                </tr>
              ))
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  const formatDuration = (duration) => {
    const parts = [];
    if (duration.hours) parts.push(`${duration.hours}h`);
    if (duration.minutes) parts.push(`${duration.minutes}m`);
    return parts.join(' ') || '0m';
  };

  return (
    <main>
      <br></br>
      <br></br>
      <br></br> 
      <section className="calendar-section">
        <div className="calendar-header">
          <h2>Application Schedule</h2>
          {!isConnected ? (
            <button onClick={connectCalendar} className="connect-button">
              Connect Calendar
            </button>
          ) : (
            <div className="view-controls">
              <button onClick={() => setView('table')} className={view === 'table' ? 'active' : ''}>
                Table View
              </button>
              <button onClick={() => setView('calendar')} className={view === 'calendar' ? 'active' : ''}>
                Calendar View
              </button>
            </div>
          )}
        </div>
  
        {isConnected && (
          <div className="calendar-wrapper">
            {loading ? (
              <div className="loading-spinner"></div>
            ) : view === 'table' ? (
              <CalendarTableView events={events} />
            ) : (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              height="auto"
              events={events.map(event => ({
                title: event.title,
                start: event.start,
                end: event.end,
              }))}
              eventColor="#0f5411"
              nowIndicator={true}
            />

            )}
          </div>
        )}

               
        {showConnectSuccess && (
          <div className="confirmation-modal">
            <div className="confirmation-content">
              <h2>Google Calendar Connected!</h2>
              <br></br>
              <p className="confirmation-message">Your calendar has been successfully linked! </p>
              <div className="confirmation-buttons">
                <button className="confirm-button" onClick={() => setShowConnectSuccess(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {showConnectError && (
          <div className="confirmation-modal">
            <div className="confirmation-content">
              <h2>Failed to Connect</h2>
              <p className="confirmation-message">{connectErrorMessage}</p>
              <div className="confirmation-buttons">
                <button className="confirm-button reject-btn" onClick={() => setShowConnectError(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </section>
    </main>
  );
}
export default RecruiterCalendar;