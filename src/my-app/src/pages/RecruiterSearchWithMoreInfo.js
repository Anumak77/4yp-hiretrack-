import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import recruiters from '../mockData.json'; 

const RecruiterSearchWithMoreInfo = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRecruiters, setFilteredRecruiters] = useState(recruiters);
  const navigate = useNavigate();

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

  const handleMoreInfoClick = (recruiter) => {
    navigate('/job-details', { state: recruiter });
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#ffe6f2',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start', 
        padding: '20px 10px', 
      }}
    >
      <section
        style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '1200px', 
        }}
      >
        <h1 style={{ color: '#ff69b4', marginBottom: '20px', textAlign: 'center' }}>Recruiter Search</h1>

        {/* Search Input */}
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

        {/* Job Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ backgroundColor: '#ff69b4', color: 'white' }}>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Job Title</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Company Name</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Location</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Application Deadline</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>More Info</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecruiters.map((recruiter, index) => (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff' }}>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{recruiter['Job Title']}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{recruiter['Company Name']}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{recruiter['Location']}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{recruiter['Application Deadline']}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>
                    <button
                      onClick={() => handleMoreInfoClick(recruiter)}
                      style={{
                        padding: '10px 16px',
                        backgroundColor: '#ff69b4',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      More Info
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};

export default RecruiterSearchWithMoreInfo;
