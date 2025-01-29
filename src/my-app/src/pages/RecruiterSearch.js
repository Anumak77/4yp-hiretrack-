import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';

const mockJobSeekers = [
  {
    firstName: "Alice",
    lastName: "Johnson",
    industry: "Software Engineering",
    location: "New York, USA",
    experience: "3 years",
  },
  {
    firstName: "Bob",
    lastName: "Smith",
    industry: "Data Science",
    location: "San Francisco, USA",
    experience: "5 years",
  },
  {
    firstName: "Charlie",
    lastName: "Davis",
    industry: "Cybersecurity",
    location: "London, UK",
    experience: "4 years",
  },
  {
    firstName: "Diana",
    lastName: "Lee",
    industry: "Product Management",
    location: "Berlin, Germany",
    experience: "2 years",
  }
];

const RecruiterSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredJobSeekers, setFilteredJobSeekers] = useState(mockJobSeekers);
  const navigate = useNavigate();

  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchTerm(query);

    if (!query) {
      setFilteredJobSeekers(mockJobSeekers);
      return;
    }

    const fuse = new Fuse(mockJobSeekers, {
      keys: ['firstName', 'lastName', 'industry' ],
      threshold: 0.4,
    });

    const result = fuse.search(query);
    setFilteredJobSeekers(result.map(({ item }) => item));
  };

  const handleMoreInfoClick = (jobSeeker) => {
    navigate('/jobseeker-details', { state: jobSeeker });
  };

  return (
    <main className="job-search-container">
      <section className="job-search-section">
        <h1 className="job-search-heading">Recruiter Search</h1>

        <input
          type="text"
          placeholder="Search by name, industry, or jobs applied for"
          value={searchTerm}
          onChange={handleSearch}
          className="job-search-input"
        />

        <div className="job-table-container">
          <table className="job-table">
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Industry</th>
                <th>Location</th>
                <th>Experience</th>
                <th>Resume</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobSeekers.length > 0 ? (
                filteredJobSeekers.map((seeker, index) => (
                  <tr key={index}>
                    <td>{seeker.firstName}</td>
                    <td>{seeker.lastName}</td>
                    <td>{seeker.industry}</td>
                    <td>{seeker.location}</td>
                    <td>{seeker.experience}</td>
                    <td>
                      <button className="more-info-button" onClick={() => handleMoreInfoClick(seeker)}>
                        View CV
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-jobs-found">
                    No job seekers found.
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

export default RecruiterSearch;
