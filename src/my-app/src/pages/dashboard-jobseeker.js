import React from 'react';
import { Link } from 'react-router-dom';

const DashJobseeker = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>


      <div style={{ display: 'flex', width: '100%', marginTop: '20px' }}>
        <div style={{ width: '20%', borderRight: '1px solid #ddd', padding: '20px' }}>
          <Link to="/profile" style={{ textDecoration: 'none', color: '#007bff' }}>Go to Profile</Link>
        </div>

        <div style={{ flexGrow: 1, padding: '20px' }}>
          <h3>Edit CVs</h3>
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            <p>Here CVs will be edited.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashJobseeker;
