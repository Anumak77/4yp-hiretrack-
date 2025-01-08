import React, { useState } from 'react';
import { analyzeSimilarity } from '../components/utils';

const CVManagement = () => {
  const [jobDescriptions, setJobDescriptions] = useState([
    'Design and develop scalable web applications',
    'Manage financial reports and forecasts',
    'Coordinate cross-functional teams for project execution',
  ]);
  const [similarityScores, setSimilarityScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSimilarityScores = async () => {
    setLoading(true);
    setError('');
    try {
      const scores = [];
      for (const description of jobDescriptions) {
        const score = await analyzeSimilarity(description);
        scores.push({ description, score });
      }
      setSimilarityScores(scores);
    } catch (err) {
      setError('Failed to fetch similarity scores. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        height: '100vh',
        backgroundColor: '#f8c8dc',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
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
        <h1 style={{ color: '#ff69b4', marginBottom: '20px' }}>CV Management</h1>

        <button
          onClick={fetchSimilarityScores}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ff69b4',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '20px',
          }}
        >
          Fetch Match Scores
        </button>

        {loading && <p>Loading...</p>}

        {error && <p style={{ color: 'red' }}>{error}</p>}

        {similarityScores.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#ff69b4', color: 'white' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Job Description</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Match Score (%)</th>
              </tr>
            </thead>
            <tbody>
              {similarityScores.map((item, index) => (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff' }}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.description}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{(item.score * 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
};

export default CVManagement;
