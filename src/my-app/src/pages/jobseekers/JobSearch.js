import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";
import Fuse from "fuse.js";
import "../../components/style.css";

const JobSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [allData, setAllData] = useState([]);
  const [searchFilter, setSearchFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("http://localhost:5000/get_jobs");
        if (!response.ok) {
          throw new Error("Failed to fetch jobs");
        }
        const data = await response.json();
        setAllData(data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };

    fetchJobs();
  }, []);

  // Handle search input changes
  const handleSearch = async (event) => {
    const query = event.target.value;
    setSearchTerm(query);

    if (!query) {
      setFilteredJobs([]);
      return;
    }

    try {
      // Call the Flask search endpoint
      const response = await fetch(
        `http://localhost:5000/search-jobs?query=${query}&filter=${searchFilter}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }
      const data = await response.json();
      setFilteredJobs(data);
    } catch (error) {
      console.error("Error searching jobs:", error);
    }
  };

  // Handle "More Info" button click
  const handleMoreInfoClick = (job) => {
    navigate("/job-details", { state: job });
  };

  return (
    <main>
              <h1 className="job-search-heading">Job Search</h1>

      <section className="job-search-container">
      <section className="job-search-content">

        {/* Search Bar & Filter Dropdown */}
        <div className="search-filter-container">
          <input
            type="text"
            placeholder={`Search by ${searchFilter}`}
            value={searchTerm}
            onChange={handleSearch}
            className="job-search-input"
          />
          <select
            className="search-filter-dropdown"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="location">Location</option>
            <option value="company">Company</option>
            <option value="title">Title</option>
          </select>
        </div>

        {/* Job Table */}
        <div className="job-table-container">
          <table className="job-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Location</th>
                <th>Deadline</th>
                <th>More Info</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length > 0 ? (
                filteredJobs.slice(0, 100).map((job, index) => (
                  <tr key={index}>
                    <td>{job["Title"] || "N/A"}</td>
                    <td>{job["Company"] || "N/A"}</td>
                    <td>{job["Location"] || "N/A"}</td>
                    <td>{job["Deadline"] || "N/A"}</td>
                    <td>
                      <button
                        className="more-info-button"
                        onClick={() => handleMoreInfoClick(job)}
                      >
                        More Info
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-jobs-found">
                    No jobs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      </section>
    </main>
  );
};

export default JobSearch;
