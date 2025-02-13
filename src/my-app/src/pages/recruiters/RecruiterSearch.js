import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import axios from 'axios';
import { fetchPdfFromFirestore } from '../../components/utils';

const getMatchScore = async (jobDescription, setMatchScores, seeker) => {
  try {
    const cvBase64 = await fetchPdfFromFirestore();
    if (!cvBase64) {
      alert('No CV found for the user. Please upload a CV.');
      return;
    }
    
    const response = await axios.post('http://127.0.0.1:5000/compare_with_description', {
      JobDescription: jobDescription,
      cv: cvBase64.split(',')[1],
    });
    
    const score = (response.data['cosine similarity'] * 100).toFixed(2);
    setMatchScores(prevScores => ({ ...prevScores, [seeker.firstName]: score }));
  } catch (error) {
    console.error('Error comparing CV with job description:', error);
    alert('An error occurred. Please try again.');
  }
};



const mockJobSeekers = [
  {
    firstName: "Alice",
    lastName: "Johnson",
    industry: "Software Engineering",
    location: "New York, USA",
    experience: "3 years",
    jobDescription: "Software Engineer with React and Node.js experience."
  },
  {
    firstName: "Bob",
    lastName: "Smith",
    industry: "Data Science",
    location: "San Francisco, USA",
    experience: "5 years",
    jobDescription: "Data Scientist with expertise in Python and Machine Learning."
  }
];

const RecruiterSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredJobSeekers, setFilteredJobSeekers] = useState(mockJobSeekers);
  const [matchScores, setMatchScores] = useState({});
  const navigate = useNavigate();

  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchTerm(query);

    if (!query) {
      setFilteredJobSeekers(mockJobSeekers);
      return;
    }

    const fuse = new Fuse(mockJobSeekers, {
      keys: ['firstName', 'lastName', 'industry'],
      threshold: 0.4,
    });

    const result = fuse.search(query);
    setFilteredJobSeekers(result.map(({ item }) => item));
  };

  return (
    <main>
      <h1 className="job-search-heading">Recruiter Search</h1>
      <section className="job-search-container">
      <div className="job-search-section">
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
                <th>Match Score</th>
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
                      {matchScores[seeker.firstName] ? (
                        `${matchScores[seeker.firstName]}%`
                      ) : (
                        <button className="more-info-button" onClick={() => getMatchScore(seeker.jobDescription, setMatchScores, seeker)}>
                          Get Match Score
                        </button>
                      )}
                    </td>
                    <td>
                      <button className="more-info-button" onClick={() => navigate('/jobseeker-details', { state: seeker })}>
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
        </div>
      </section>
    </main>
  );
};

export default RecruiterSearch;