import React, { useState, useEffect } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import '../../components/style.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const JobTrackerRecruiter = () => {
  const [jobTrends, setJobTrends] = useState([]);
  const [locationFilter, setLocationFilter] = useState('');
  const [allLocations, setAllLocations] = useState([]);

  const monthOrder = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  useEffect(() => {
    const fetchTrends = async () => {
      const res = await fetch("http://localhost:5000/get-all-job-application-trends");
      const data = await res.json();
      const cleaned = data.map(d => ({
        ...d,
        location: d.location || 'Unknown',
        month: d.month || 'Unknown'
      }));
      setJobTrends(cleaned);

      const locations = [...new Set(cleaned.map(item => item.location))];
      setAllLocations(locations);
    };
    fetchTrends();
  }, []);

  const filtered = locationFilter
    ? jobTrends.filter(trend => trend.location === locationFilter)
    : jobTrends;

  const locationCounts = filtered.reduce((acc, trend) => {
    acc[trend.location] = (acc[trend.location] || 0) + trend.totalApplications;
    return acc;
  }, {});

  const topTrends = [...filtered]
    .sort((a, b) => b.totalApplications - a.totalApplications)
    .slice(0, 7);

  const monthlyCounts = filtered.reduce((acc, trend) => {
    acc[trend.month] = (acc[trend.month] || 0) + trend.totalApplications;
    return acc;
  }, {});

  const sortedMonths = monthOrder.filter(month => monthlyCounts[month]);
  const navigate = useNavigate();


  return (
    <main>
      <br></br><br></br><br></br>
      <h1 className="job-tracker__title">Job Application Trends</h1>

      <section className="job-tracker__card">
        <button
          className="back-button"
          onClick={() => navigate('/dashboard-recruiter')}
        >
          Back to Dashboard
        </button>

        <h2>Applications by Location</h2>
        <div className="chart-container pie-chart">
          <Pie
            data={{
              labels: Object.keys(locationCounts),
              datasets: [{
                data: Object.values(locationCounts),
                backgroundColor: ['#1A3E31', '#2C5C4A', '#324A6D', '#395E59', '#48624C']
              }]
            }}
          />
        </div>
      </section>

      <div className="filter-container">
        <label>Filter by Location: </label>
        <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
          <option value="">All Locations</option>
          {allLocations.map((loc, idx) => (
            <option key={idx} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      <div className="trends-section">
        <section className="job-tracker__card">
          <h2>Top Jobs by Applications</h2>
          <div className="chart-container bar-chart">
            <Bar
              data={{
                labels: topTrends.map(t => t.jobTitle),
                datasets: [{
                  label: 'Applications',
                  data: topTrends.map(t => t.totalApplications),
                  backgroundColor: '#395E59'
                }]
              }}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, precision: 0 }
                  }
                }
              }}
            />
          </div>
        </section>

        <section className="job-tracker__card">
          <h2>Monthly Application Trends</h2>
          <div className="chart-container line-chart">
            <Line
              data={{
                labels: sortedMonths,
                datasets: [{
                  label: 'Applications',
                  data: sortedMonths.map(month => monthlyCounts[month]),
                  borderColor: '#1A3E31',
                  tension: 0.3
                }]
              }}
            />
          </div>
        </section>
      </div>
    </main>
  );
};

export default JobTrackerRecruiter;
