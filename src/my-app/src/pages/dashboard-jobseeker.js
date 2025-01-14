import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { analyzeSimilarity } from '../components/utils';

const DashJobseeker = () => {
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      <div style={{ display: 'flex', width: '100%', marginTop: '20px' }}>
        <div style={{ width: '20%', borderRight: '1px solid #ddd', padding: '20px' }}>
          <Link to="/profile" style={{ textDecoration: 'none', color: '#007bff' }}>Go to Profile</Link>
        </div>

        <div style={{ flexGrow: 1, padding: '20px' }}>
          <h3>Job Match Scores</h3>
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
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

            <div
              style={{
                border: '2px solid #007bff',
                borderRadius: '8px',
                padding: '20px',
                marginTop: '20px',
                textAlign: 'center',
                backgroundColor: '#f1f1f1',
                color: '#007bff',
                fontWeight: 'bold',
                fontSize: '18px',
              }}
            >
              Edit CV
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashJobseeker;
