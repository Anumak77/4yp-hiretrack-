import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { getAuth } from "firebase/auth";
import React, { useState, useEffect } from "react";
import "../../components/style.css";
import { useGoogleLogin } from '@react-oauth/google';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, intervalToDuration } from 'date-fns';
import "../../components/style.css";
import "../../components/cal.css";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const locales = {
  'en-US': require('date-fns/locale/en-US')
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const RecruiterCalendar = () => {
  const [selectedJob, setSelectedJob] = useState("");
  const [jobApplications, setJobApplications] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [jobStatus, setJobStatus] = useState("Applied");
  const [events, setEvents] = useState([]);
  const auth = getAuth();
  const user = auth.currentUser;
  const [loading, setLoading] = useState("")
  const [view, setView] = useState('week'); 
  const [height, setHeight] = useState(400);
  const [isConnected, setIsConnected] = useState(false);


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
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    flow: 'implicit',
    prompt: 'consent'
  });

  useEffect(() => {
    if (isConnected) {
    const fetchEvents = async () => {      
      setLoading(true);
      try {
        const idToken = await user.getIdToken();
        const response = await fetch('http://localhost:5000/get-calendar-events', {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch events');
        
        const data = await response.json();
        const formattedEvents = data.items.map(event => ({
          id: event.id,
          title: event.summary || 'No Title',
          start: new Date(event.start.dateTime || event.start.date),
          end: new Date(event.end.dateTime || event.end.date),
          allDay: !event.start.dateTime,
        }));
        
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
      <strong>{event.title}</strong>
      {event.resource.description && <div>{event.resource.description}</div>}
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
      <br></br> /* please do not remove these breaks */
      <section className="calendar-section">
        <div className="calendar-header">
          <h2>Application Schedule</h2>
          {!isConnected ? (
            <button onClick={connectCalendar} className="connect-button">
              <img src="/google-calendar-icon.png" alt="Google Calendar" />
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
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                views={['month', 'week', 'day']}
                view={view === 'calendar' ? 'week' : view}
                onView={setView}
                defaultDate={new Date()}
                components={{
                  event: CustomEvent,
                  toolbar: CustomToolbar
                }}
              />
            )}
          </div>
        )}
      </section>
    </main>
  );
}
export default RecruiterCalendar;