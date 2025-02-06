import React, { useState } from "react";
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
import "../components/style.css"; 

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const jobOptions = ["Software Engineer", "Data Analyst", "Project Manager", "Product Designer", "Marketing Specialist"];

const JobTrackerJobseeker = () => {
  const [selectedJob, setSelectedJob] = useState("");
  const [jobApplications, setJobApplications] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [jobStatus, setJobStatus] = useState("Applied");

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
    labels: jobApplications.map((app) => app.jobTitle),
    datasets: [
      {
        label: "Applications",
        data: jobApplications.map(() => 1),
        backgroundColor: [
          "#192231",
          "#404a42",
          "#c0b283",
          "#eddbcd",
          "#f4f4f4",
        ],
        borderColor: "f4f4f4", 
        borderWidth: 1,
      },
    ],
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
  

  return (
    <main className="jobtracker-container">

      <section className="jobtracker-form">
        <h2 className="jobtracker-chart-heading">Job Tracker Dashboard</h2>
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
          <button onClick={() => handleStatusChange("Applied")} className="jobtracker-status-button applied">
            Applied
          </button>
          <button onClick={() => handleStatusChange("Interviewed")} className="jobtracker-status-button interviewed">
            Interviewed
          </button>
          <button onClick={() => handleStatusChange("Rejected")} className="jobtracker-status-button rejected">
            Rejected
          </button>
        </div>

        <button onClick={handleAddApplication} className="jobtracker-add-button">
          Add Application
        </button>
      </section>

      <div className="jobtracker-chart-container">
        <h2 className="jobtracker-chart-heading">Bar Chart - Applications Per Job</h2>
        <div className="jobtracker-bar-chart">
          <Bar data={barChartData} />
        </div>
      </div>

      <div className="jobtracker-chart-container">
        <h2 className="jobtracker-chart-heading">Pie Chart - Job Status</h2>
        <div className="jobtracker-pie-chart">
          <Pie data={pieChartData} />
        </div>
      </div>
    </main>
  );
};

export default JobTrackerJobseeker;
