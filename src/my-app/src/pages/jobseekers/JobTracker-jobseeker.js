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
import { format, parse, startOfWeek, getDay } from 'date-fns';
import "../../components/style.css";
import "../../components/JobTracker-jobseeker.css";
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const jobOptions = ["Software Engineer", "Data Analyst", "Project Manager", "Product Designer", "Marketing Specialist"];

const JobTrackerJobseeker = () => {
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

  useEffect(() => {
  const fetchAppliedJobs = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.log("User not authenticated");
        return;
      }

      const idToken = await user.getIdToken();

      const [appliedResponse, rejectedResponse, interviewResponse] = await Promise.all([
        fetch(`http://localhost:5000/fetch-jobseeker-jobs/appliedjobs`, {
          method: "GET",
          headers: {
            "Authorization": idToken,
          },
        }),
        fetch(`http://localhost:5000/fetch-jobseeker-jobs/rejectedjobs`, {
          method: "GET",
          headers: {
            "Authorization": idToken,
          },
        }),
        fetch(`http://localhost:5000/fetch-jobseeker-jobs/interviewjobs`, {
          method: "GET",
          headers: {
            "Authorization": idToken,
          },
        }),
      ]);

      if (!appliedResponse.ok || !rejectedResponse.ok || !interviewResponse.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const appliedJobs = await appliedResponse.json();
      const rejectedJobs = await rejectedResponse.json();
      const interviewJobs = await interviewResponse.json();

      const jobs = [
        ...appliedJobs.map((job) => ({ ...job, status: "Applied" })),
        ...rejectedJobs.map((job) => ({ ...job, status: "Rejected" })),
        ...interviewJobs.map((job) => ({ ...job, status: "Interviewed" })),
      ];

      setJobApplications(jobs);
    } catch (error) {
      console.error("Error fetching jobs", error);
    }
  };

  fetchAppliedJobs();
}, []);

  const handleAddApplication = () => {
    if (!selectedJob || !dueDate) {
      alert("Please select a job and enter a due date.");
      return;
    }

    const newApplication = {
      jobTitle: selectedJob,
      dueDate,
      status: jobStatus,
    };

    setJobApplications([...jobApplications, newApplication]);
    setSelectedJob("");
    setDueDate("");
  };

  const handleStatusChange = (status) => {
    setJobStatus(status);
  };

  const barChartData = {
    labels: ["Applied", "Interviewed", "Rejected"], 
    datasets: [
      {
        label: "Number of Applications",
        data: [
          jobApplications.filter((app) => app.status === "Applied").length,
          jobApplications.filter((app) => app.status === "Interviewed").length, 
          jobApplications.filter((app) => app.status === "Rejected").length, 
        ],
        backgroundColor: [
          "#c0b283", 
          "#404a42", 
          "#192231", 
        ],
        borderColor: "f4f4f4", 
        borderWidth: 1,
      },
    ],    
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true, 
        ticks: {
          stepSize: 1, 
        },
      },
    },
  };
  
  
  const pieChartData = {
    labels: ["Applied", "Interviewed", "Rejected"],
    datasets: [
      {
        data: [
          jobApplications.filter((app) => app.status === "Applied").length,
          jobApplications.filter((app) => app.status === "Interviewed").length,
          jobApplications.filter((app) => app.status === "Rejected").length,
        ],
        backgroundColor: [
          "#c0b283", // Applied
          "#404a42", // Interviewed
          "#192231", // Rejected
        ],
        borderColor: "var(--neutral-white)",
        borderWidth: 2,
      },
    ],
  };

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

  const fetchCalendarEvents = async () => {
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
      const events = data.items.map(event => ({
        id: event.id,
        title: event.summary || 'No Title',
        start: new Date(event.start.dateTime || event.start.date),
        end: new Date(event.end.dateTime || event.end.date),
        allDay: !event.start.dateTime,
        color: event.colorId ? `#${getColorHex(event.colorId)}` : '#4285F4'
      }));
      
      setCalendarEvents(events);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  
  useEffect(() => {
    const checkConnection = async () => {
      const userDoc = await getDoc(doc(getFirestore(), 'users', user.uid));
      setIsConnected(!!userDoc.data()?.googleTokens?.accessToken);
    };
    if (user) checkConnection();
  }, [user]);
  
  useEffect(() => {
    if (isConnected) fetchEvents();
  }, [isConnected]);

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
    };}
  

    return (
      <main>
        <h2 className="jobtracker-chart-title">Job Tracker Dashboard</h2>
    
        <div className="jobtracker-container">
          {/* Application Form Section */}
          <section className="jobtracker-form">
            <select className="jobtracker-select" value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)}>
              <option value="">Select a Job</option>
              {jobOptions.map((job, index) => (
                <option key={index} value={job}>{job}</option>
              ))}
            </select>
    
            <input 
              type="date" 
              className="input-date" 
              value={dueDate} 
              onChange={(e) => setDueDate(e.target.value)} 
            />
    
            <div className="jobtracker-status-buttons">
              <button
                onClick={() => handleStatusChange("Applied")}
                className={`jobtracker-status-button applied ${jobStatus === "Applied" ? "active" : ""}`}
              >
                Applied
              </button>
              <button
                onClick={() => handleStatusChange("Interviewed")}
                className={`jobtracker-status-button interviewed ${jobStatus === "Interviewed" ? "active" : ""}`}
              >
                Interviewed
              </button>
              <button
                onClick={() => handleStatusChange("Rejected")}
                className={`jobtracker-status-button rejected ${jobStatus === "Rejected" ? "active" : ""}`}
              >
                Rejected
              </button>
            </div>
    
            <button onClick={handleAddApplication} className="jobtracker-add-button">
              Add Application
            </button>
          </section>
    
          {/* Charts Section - Side by Side */}
          <div className="charts-row">
            <div className="chart-container">
              <h3 className="chart-title">Applications Status (Bar)</h3>
              <div className="chart-wrapper">
                <Bar 
                  data={barChartData} 
                  options={chartOptions} 
                  style={{ width: '100%', height: '400px' }} 
                />
              </div>
            </div>
    
            <div className="chart-container">
              <h3 className="chart-title">Applications Breakdown (Pie)</h3>
              <div className="chart-wrapper">
                <Pie 
                  data={pieChartData} 
                  style={{ width: '100%', height: '400px' }} 
                />
              </div>
            </div>
          </div>
    
          {/* Calendar Section - Below Charts */}
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
                  <button onClick={() => setView('day')} className={view === 'day' ? 'active' : ''}>
                    Day
                  </button>
                  <button onClick={() => setView('week')} className={view === 'week' ? 'active' : ''}>
                    Week
                  </button>
                  <button onClick={() => setView('month')} className={view === 'month' ? 'active' : ''}>
                    Month
                  </button>
                </div>
              )}
            </div>
    
            {isConnected && (
              <div className="calendar-wrapper" style={{ height: `${height}px` }}>
                {loading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    views={['month', 'week', 'day']}
                    view={view}
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
        </div>
      </main>
    );
  }

export default JobTrackerJobseeker;
