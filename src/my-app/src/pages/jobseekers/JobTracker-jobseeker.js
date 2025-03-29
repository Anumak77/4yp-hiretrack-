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
import { getFirestore, collection, getDocs } from "firebase/firestore";
import "../../components/style.css";
import { auth } from '../../components/firebaseconfigs'; 
import { useGoogleLogin } from '@react-oauth/google';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const jobOptions = ["Software Engineer", "Data Analyst", "Project Manager", "Product Designer", "Marketing Specialist"];

const JobTrackerJobseeker = () => {
  const [selectedJob, setSelectedJob] = useState("");
  const [jobApplications, setJobApplications] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [jobStatus, setJobStatus] = useState("Applied");


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
    scope: 'https://www.googleapis.com/auth/calendar.events',
    flow: 'implicit',
    prompt: 'consent'
  });

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
  <h2>Google Calendar Integration (Coming Soon)</h2>
  <p>Sync your job application deadlines with Google Calendar to stay on top of your applications.</p>
  <button onClick={connectCalendar} className="google-connect-button">
      Connect Google Calendar
    </button>
  </section>

    </main>
  );
};

export default JobTrackerJobseeker;
