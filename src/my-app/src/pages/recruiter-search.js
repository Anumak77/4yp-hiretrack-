import React, { useState, useEffect } from 'react';

const mockRecruiters = [
  {
    TITLE: 'Database Developer',
    LOCATION: 'Yerevan, Armenia',
    'JOB DESCRIPTION': 'Design stable, reliable and effective databases; optimize and maintain legacy systems; gather user requirements and identify new features.',
  },
  {
    TITLE: 'Chief Financial Officer',
    LOCATION: 'New York, USA',
    'JOB DESCRIPTION': 'Manage financial actions of the company, track cash flow, analyze financial strengths and weaknesses, and propose strategic directions.',
  },
  {
    TITLE: 'Project Manager',
    LOCATION: 'London, UK',
    'JOB DESCRIPTION': 'Coordinate internal resources and third parties/vendors for the flawless execution of projects. Ensure that projects are delivered on-time, within scope and within budget.',
  },
  {
    TITLE: 'Software Engineer',
    LOCATION: 'San Francisco, USA',
    'JOB DESCRIPTION': 'Develop, test, and maintain scalable web applications. Work with cross-functional teams to deliver high-quality software solutions.',
  },
  {
    TITLE: 'Data Analyst',
    LOCATION: 'Toronto, Canada',
    'JOB DESCRIPTION': 'Interpret data, analyze results using statistical techniques and provide ongoing reports. Develop and implement databases and data collection systems.',
  },
];

const RecruiterSearch = () => {
  const [recruiters, setRecruiters] = useState(mockRecruiters);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRecruiters, setFilteredRecruiters] = useState(mockRecruiters);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);

    const filtered = recruiters.filter((recruiter) =>
      Object.values(recruiter)
        .join(' ')
        .toLowerCase()
        .includes(e.target.value.toLowerCase())
    );

    setFilteredRecruiters(filtered);
  };

  return (
    <main style={{ height: '100vh', backgroundColor: '#f8c8dc', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }} >
      <section style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0px 6px 16px rgba(200, 120, 140, 0.3)', textAlign: 'center', maxWidth: '800px', width: '100%' }} >
        <h1 style={{ color: '#ff69b4', marginBottom: '20px' }}>Recruiter Search</h1>

        <input
          type="text"
          placeholder="Search by title, location, or description"
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ccc' }}
        />

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#ff69b4', color: 'white' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Title</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Location</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Job Description</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecruiters.length > 0 ? (
              filteredRecruiters.map((recruiter, index) => (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff' }}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{recruiter.TITLE}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{recruiter.LOCATION}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{recruiter['JOB DESCRIPTION']}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ padding: '10px', textAlign: 'center', color: '#555' }}>
                  No recruiters found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
};

export default RecruiterSearch;
