import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Fuse from "fuse.js";
import "../../components/style.css";

const JobSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [searchFilter, setSearchFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(10); // or set this to whatever page size you like

  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("http://localhost:5000/jobs");
        if (!response.ok) {
          throw new Error("Failed to fetch jobs");
        }
        const data = await response.json();
        setAllJobs(data);
        setFilteredJobs(data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };
    fetchJobs();
  }, []);

  // Handle search input
  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchTerm(query);

    // If the search bar is empty, show all jobs again
    if (!query) {
      setFilteredJobs(allJobs);
      setCurrentPage(1);
      return;
    }

    const fuseOptions = {
      keys: ["Title", "Company", "Location"], 
      threshold: 0.6,
    };

    const fuse = new Fuse(allJobs, fuseOptions);
    const results = fuse.search(query);
    const matchedJobs = results.map((result) => result.item);

    setFilteredJobs(matchedJobs);
    setCurrentPage(1);
  };

  // Handle "More Info" button
  const handleMoreInfoClick = (job) => {
    navigate("/job-details", { state: job });
  };

  // Pagination helpers
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const handleNextPage = () => {
    // Don’t go beyond the last page
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  };

  const handlePreviousPage = () => {
    // Don’t go before page 1
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  // Determine which jobs to display on the current page
  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

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
                {paginatedJobs.length > 0 ? (
                  paginatedJobs.map((job, index) => (
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

          {/* Pagination Controls */}
          <div className="pagination-controls">
            <button onClick={handlePreviousPage} disabled={currentPage === 1}>
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </button>
          </div>
        </section>
      </section>
    </main>
  );
};

export default JobSearch;
