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


const RecruiterSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [jobSeekers, setJobSeekers] = useState([]);
  const [filteredJobSeekers, setFilteredJobSeekers] = useState(jobSeekers);
  const [matchScores, setMatchScores] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobSeekers = async () => {
      const db = getFirestore();
      const seekersCollection = collection(db, 'users');
      const seekerSnapshot = await getDocs(seekersCollection);
      const seekersData = seekerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setJobSeekers(seekersData);
      setFilteredJobSeekers(seekersData);
    };

    fetchJobSeekers();
  }, []);

  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchTerm(query);

    if (!query) {
      setFilteredJobSeekers(jobSeekers);
      return;
    }

    const fuse = new Fuse(jobSeekers, {
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
                    <td>{seeker.first_name}</td>
                    <td>{seeker.last_name}</td>
                    <td>{seeker.industry}</td>
                    <td>{seeker.location}</td>
                    <td>{seeker.experience}</td>
                    <td>
                      {matchScores[seeker.first_name] ? (
                        `${matchScores[seeker.first_name]}%`
                      ) : (
                        <button className="more-info-button" onClick={() => getMatchScore(seeker.jobDescription, setMatchScores, seeker)}>
                          Get Match Score
                        </button>
                      )}
                    </td>
                    <td>
                      <button className="more-info-button" onClick={() => navigate('/jobseeker-details', { state: seeker })}>
                        View Details
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