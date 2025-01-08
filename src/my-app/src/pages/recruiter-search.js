import React, { useState } from 'react';
import { recruiters } from '../mockData.js';

const RecruiterSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRecruiters, setFilteredRecruiters] = useState(recruiters);

  const handleSearchChange = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = recruiters.filter((recruiter) =>
      Object.values(recruiter)
        .join(' ')
        .toLowerCase()
        .includes(term)
    );

    setFilteredRecruiters(filtered);
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8c8dc',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        padding: '20px',
      }}
    >
      <section
        style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0px 6px 16px rgba(200, 120, 140, 0.3)',
          textAlign: 'center',
          maxWidth: '800px',
          width: '100%',
        }}
      >
        <h1 style={{ color: '#ff69b4', marginBottom: '20px' }}>Recruiter Search</h1>

        {/* Search input */}
        <input
          type="text"
          placeholder="Search by name, job title, or location"
          value={searchTerm}
          onChange={handleSearchChange}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '20px',
            borderRadius: '8px',
            border: '1px solid #ccc',
          }}
        />

        {/* Results table */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#ff69b4', color: 'white' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Title</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Location</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Job Description</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecruiters.map((recruiter, index) => (
              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff' }}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{recruiter.TITLE}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{recruiter.LOCATION}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{recruiter['JOB DESCRIPTION']}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
};

export default RecruiterSearch;
