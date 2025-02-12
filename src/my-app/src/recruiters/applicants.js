import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { fetchPdfFromFirestore, fetchApplicants } from '../components/utils';
import { getFirestore, collection, getDocs } from "firebase/firestore";

const getMatchScore = async (jobDescription, setMatchScores, applicant) => {
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
    setMatchScores(prevScores => ({ ...prevScores, [applicant.first_name]: score }));
  } catch (error) {
    console.error('Error comparing CV with job description:', error);
    alert('An error occurred. Please try again.');
  }
};


const ApplicantSearch = () => { 
    const [searchTerm, setSearchTerm] = useState('');
    const [applicants, setApplicants] = useState([]);
    const [filteredApplicants, setFilteredApplicants] = useState([]);
    const [matchScores, setMatchScores] = useState({});
    const navigate = useNavigate();
    const location = useLocation();
    const { jobId } = location.state || {};
  
    useEffect(() => {
        console.log("use effect is being triggered");

        if (!jobId) {
            console.log("jobId is not available, skipping loadApplicants.");
            return;
          }
        
          console.log("jobId in useEffect:", jobId);

      const loadApplicants = async () => {
        console.log("Loading applicants for jobId:", jobId);
        try {
          const applicantsData = await fetchApplicants(jobId); // Pass jobId
          setApplicants(applicantsData);
          setFilteredApplicants(applicantsData);
        } catch (error) {
          console.error("Error loading applicants:", error);
        }
      };
  
      if (jobId) {
        loadApplicants();
      }
    }, [jobId]);
  
    // Search functionality
    const handleSearch = (event) => {
      const query = event.target.value;
      setSearchTerm(query);
  
      if (!query) {
        setFilteredApplicants(applicants);
        return;
      }
  
      const fuse = new Fuse(applicants, {
        keys: ['firstName', 'lastName', 'industry'],
        threshold: 0.4,
      });
  
      const result = fuse.search(query);
      setFilteredApplicants(result.map(({ item }) => item));
    };

  return (
    <main className="job-search-container">
      <section className="job-search-section">
        <h1 className="job-search-heading">Applicant Search</h1>
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
              {filteredApplicants.length > 0 ? (
                filteredApplicants.map((applicant, index) => (
                  <tr key={index}>
                    <td>{applicant.first_name}</td>
                    <td>{applicant.last_name}</td>
                    <td>{applicant.industry}</td>
                    <td>{applicant.location}</td>
                    <td>{applicant.experience}</td>
                    <td>
                      {matchScores[applicant.first_name] ? (
                        `${matchScores[applicant.first_name]}%`
                      ) : (
                        <button className="more-info-button" onClick={() => getMatchScore(applicant.jobDescription, setMatchScores, applicant)}>
                          Get Match Score
                        </button>
                      )}
                    </td>
                    <td>
                      <button className="more-info-button" onClick={() => navigate('/jobapplicant-details', { state: applicant })}>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-jobs-found">
                    No job applicants found.
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

export default ApplicantSearch;