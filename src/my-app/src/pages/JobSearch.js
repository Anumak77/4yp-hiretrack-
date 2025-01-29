import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import Fuse from 'fuse.js';

const JobSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [allData, setAllData] = useState([]);
  const navigate = useNavigate();

  const firebaseConfig = {
    databaseURL: "https://hiretrack-7b035-default-rtdb.europe-west1.firebasedatabase.app/",
  };

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  const database = getDatabase(app);

  useEffect(() => {
    const databaseRef = ref(database);

    const unsubscribe = onValue(databaseRef, (snapshot) => {
      if (snapshot.exists()) {
        console.log("found in the database")
        const data = snapshot.val();
        const dataArray = Object.values(data);
        console.log("First item in the database:", dataArray[0]);
        setAllData(dataArray);
      } else {
        console.error("No data found in the database");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchTerm(query);

    if (query === "") {
      window.alert("Please enter a search term to filter jobs.");
      return;
    }

    const fuse = new Fuse(allData, {
      keys: ['Title', 'Company', 'Location'], 
      threshold: 0.4,  
    });

    const result = fuse.search(query);
    const filtered = result.map(({ item }) => item);
    setFilteredJobs(filtered);
  };

  const handleMoreInfoClick = (job) => {
    navigate('/job-details', { state: job });
  };

  return (
    <main className="job-search-container">
      <section className="job-search-section">
        <h1 className="job-search-heading">Job Search</h1>

        <input
          type="text"
          placeholder="Search by job title, company name, or location"
          value={searchTerm}
          onChange={handleSearch}
          className="job-search-input"
        />

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
                    <td>{job['Title'] || "N/A"}</td>
                    <td>{job['Company'] || "N/A"}</td>
                    <td>{job['Location'] || "N/A"}</td>
                    <td>{job['Deadline'] || "N/A"}</td>
                    <td>
                      <button className="more-info-button" onClick={() => handleMoreInfoClick(job)}>
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
    </main>
  );
};

export default JobSearch;
