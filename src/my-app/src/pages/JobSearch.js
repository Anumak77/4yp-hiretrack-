import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const JobSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5001/jobs')
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          const validJobs = data.filter(job => job['Title'] && job['Company']);
          setAllJobs(validJobs);
          setFilteredJobs(validJobs);
        } else {
          console.error("Invalid job data format:", data);
        }
      })
      .catch(error => console.error("Error fetching jobs:", error));
  }, []);

  const handleSearchChange = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = allJobs.filter(job =>
      Object.values(job)
        .map(value => (value ? value.toString().toLowerCase() : ""))
        .join(' ')
        .includes(term)
    );

    setFilteredJobs(filtered);
  };

  const handleMoreInfoClick = (job) => {
    navigate('/job-details', { state: job });
  };

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#ffe6f2',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: '20px 10px',
    }}>
      <section style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '1200px',
      }}>
        <h1 style={{ color: '#ff69b4', marginBottom: '20px', textAlign: 'center' }}>Job Search</h1>

        <input
          type="text"
          placeholder="Search by job title, company name, or location"
          value={searchTerm}
          onChange={handleSearchChange}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '20px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            fontSize: '16px',
            boxSizing: 'border-box',
          }}
        />

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ backgroundColor: '#ff69b4', color: 'white' }}>
                <th style={{ width: '25%', padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Job Title</th>
                <th style={{ width: '20%', padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Company</th>
                <th style={{ width: '20%', padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Location</th>
                <th style={{ width: '15%', padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Deadline</th>
                <th style={{ width: '10%', padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>More Info</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length > 0 ? (
                filteredJobs.slice(0, 100).map((job, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: '10px', border: '1px solid #ddd', wordWrap: 'break-word' }}>
                      {job['Title'] || "N/A"}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', wordWrap: 'break-word' }}>
                      {job['Company'] || "N/A"}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', wordWrap: 'break-word' }}>
                      {job['Location'] || "N/A"}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', wordWrap: 'break-word' }}>
                      {job['Deadline'] || "N/A"}
                    </td>
                    <td style={{ padding: '10px', textAlign: "center" }}>
                      <button 
                        onClick={() => handleMoreInfoClick(job)}
                        style={{
                          backgroundColor: '#ff69b4',
                          border: 'none',
                          color: 'white',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}>
                        More Info
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                    No jobs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};

export default JobSearch;
