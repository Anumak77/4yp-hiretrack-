import React, { useState } from 'react';
import recruiters from '../mockData.json';

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
        backgroundColor: '#ffe6f2',
        padding: '40px 20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <section
        style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          maxWidth: '900px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <h1 style={{ color: '#ff69b4', marginBottom: '20px', fontSize: '28px' }}>Recruiter Search</h1>

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
          }}
        />

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          {filteredRecruiters.map((recruiter, index) => (
            <div
              key={index}
              style={{
                backgroundColor: '#fff',
                padding: '20px',
                margin: '10px',
                borderRadius: '12px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                width: 'calc(50% - 20px)',
                minWidth: '280px',
              }}
            >
              <h2 style={{ color: '#ff69b4', fontSize: '20px', marginBottom: '10px' }}>{recruiter['Job Title']}</h2>
              <p style={{ color: '#666', fontSize: '16px', marginBottom: '10px' }}>
                <strong>Company:</strong> {recruiter['Company Name']}
              </p>
              <p style={{ color: '#666', fontSize: '16px', marginBottom: '10px' }}>
                <strong>Location:</strong> {recruiter['Location']}
              </p>
              <p style={{ color: '#999', fontSize: '14px', marginBottom: '20px' }}>
                <strong>Application Deadline:</strong> {recruiter['Application Deadline']}
              </p>
              <button
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ff69b4',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                }}
                onClick={() => alert('bro huh')}
              >
                More Info
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default RecruiterSearch;
