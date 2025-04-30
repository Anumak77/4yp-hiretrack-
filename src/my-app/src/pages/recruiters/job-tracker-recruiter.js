import React, { useState, useEffect } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement
} from 'chart.js';
import '../../components/style.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement
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
            const url = new URL("http://localhost:5000/get-all-job-application-trends");
            const res = await fetch(url);
            const data = await res.json();
            const cleanedData = data.map(d => ({
                ...d,
                location: d.location || 'Unknown',
                month: d.month || 'Unknown'
            }));
            setJobTrends(cleanedData);

            const uniqueLocations = Array.from(new Set(cleanedData.map(item => item.location)));
            setAllLocations(uniqueLocations);
        };
        fetchTrends();
    }, []);

    const filteredTrends = locationFilter
        ? jobTrends.filter(trend => trend.location === locationFilter)
        : jobTrends;

    const topTrends = [...filteredTrends]
        .sort((a, b) => b.totalApplications - a.totalApplications)
        .slice(0, 7);

    const barChartData = {
        labels: topTrends.map(trend => trend.jobTitle),
        datasets: [{
            label: 'Total Applications',
            data: topTrends.map(trend => trend.totalApplications),
            backgroundColor: ['#294142', '#395E59', '#20352F', '#1E2E3D', '#324A6D', '#3B4F3C', '#2C5C4A']
        }]
    };

    const barChartOptions = {
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 1, precision: 0 }
            }
        }
    };

    const pieOptions = {
        maintainAspectRatio: false,
        responsive: true
    };

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    precision: 0
                }
            }
        }
    };


    const locationCounts = filteredTrends.reduce((acc, trend) => {
        const loc = trend.location;
        acc[loc] = (acc[loc] || 0) + trend.totalApplications;
        return acc;
    }, {});

    const pieChartData = {
        labels: Object.keys(locationCounts),
        datasets: [{
            data: Object.values(locationCounts),
            backgroundColor: ['#1A3E31', '#48624C', '#25384E', '#1A3E31', '#2C5C4A', '#3B4F3C', '#324A6D']
        }]
    };
    const monthlyCounts = filteredTrends.reduce((acc, trend) => {
        const month = trend.month;
        acc[month] = (acc[month] || 0) + trend.totalApplications;
        return acc;
    }, {});
    const sortedMonths = monthOrder.filter(m => monthlyCounts[m]);
    const lineChartData = {
        labels: sortedMonths,
        datasets: [{
            label: 'Applications',
            data: sortedMonths.map(month => monthlyCounts[month]),
            fill: false,
            borderColor: '#1A3E31',
            tension: 0.3
        }]
    };

    return (
        <main>
            <br></br>
            <br></br>
            <h1 className="job-tracker__title">Job Application Trends</h1>

            <section className="job-tracker__card">
                <h2>Applications by Location</h2>
                <div className="chart-container pie-chart">
                    <Pie data={pieChartData} options={pieOptions} />
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
                        <Bar data={barChartData} options={barChartOptions} />
                    </div>
                </section>

                <section className="job-tracker__card">
                    <h2>Monthly Application Trends</h2>
                    <div className="chart-container line-chart">
                        <Line data={lineChartData} options={lineChartOptions} />
                    </div>
                </section>
            </div>


        </main >

    );
};

export default JobTrackerRecruiter;
