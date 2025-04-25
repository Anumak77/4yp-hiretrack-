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
import { getFirestore, collection, getDoc, doc } from "firebase/firestore";
import "../../components/style.css";
import { auth } from '../../components/firebaseconfigs'; 
import { useGoogleLogin } from '@react-oauth/google';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const jobOptions = ["Software Engineer", "Data Analyst", "Project Manager", "Product Designer", "Marketing Specialist"];

const JobTrackerJobseeker = () => {
  const [selectedJob, setSelectedJob] = useState("");
  const [jobApplications, setJobApplications] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [jobStatus, setJobStatus] = useState("Applied");
  const [isConnected, setIsConnected] = useState(false);
  const GOOGLE_CLIENT_ID = "714625690444-bjnr3aumebso58niqna7613rtvmc5e6f.apps.googleusercontent.com"
  const GOOGLE_CLIENT_SECRET = "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"
  const [events, setEvents] = useState([]);
  const auth = getAuth();
  const user = auth.currentUser;
  const [loading, setLoading] = useState("")
  const [view, setView] = useState('week'); 
  const [height, setHeight] = useState(400);
  
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
    };}

  return (
    <main>

<h2 className="jobtracker-chart-title">Job Tracker Dashboard</h2>

      <section className="jobtracker-container">

      <section className="jobtracker-form">
        <select className="jobtracker-select" value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)}>
          <option value="">Select a Job</option>
          {jobOptions.map((job, index) => (
            <option key={index} value={job}>
              {job}
            </option>
          ))}
        </select>

        <input type="date" className="input-date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
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

      <div className="jobtracker-charts-container">
      <div className="jobtracker-chart-container">
        <h2 className="jobtracker-chart-heading">Bar Chart - Applications Per Status</h2>
        <div className="jobtracker-bar-chart">
        <div className="jobtracker-bar-chart" style={{ width: "400px", height: "400px" }}>
          <Bar data={barChartData} options={chartOptions} />
        </div>
        </div>
      </div>

      <div className="jobtracker-chart-container">
        <h2 className="jobtracker-chart-heading">Pie Chart - Job Status</h2>
        <div className="jobtracker-pie-chart">
          <Pie data={pieChartData} />
        </div>
      </div>
      </div>
      </section>

      
      <section className="google-calendar-integration">
          <h2>Google Calendar Integration</h2>
          {!isConnected ? (
            <button onClick={connectCalendar} className="google-connect-button">
              Connect Google Calendar
            </button>
          ) : (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              eventColor="#0f5411"
              height="auto"
              nowIndicator={true}
              events={events}
            />
          )}
        </section>

    </main>
  );
};

export default JobTrackerJobseeker;
