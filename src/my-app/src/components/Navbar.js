import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav
      style={{
        backgroundColor: '#ff69b4', // Updated background color
        padding: '10px 20px',
        boxShadow: '#f5f5f5',
        position: 'sticky',
        top: '0',
        zIndex: '1000',
      }}
    >
      <ul
        style={{
          display: 'flex',
          justifyContent: 'space-between', // Ensures proper alignment
          alignItems: 'center',
          listStyle: 'none',
          margin: 0,
          padding: 0,
        }}
      >
        <li style={{ margin: '0 10px' }}>
          <NavLink
            to="/profile"
            style={{ textDecoration: 'none', color: 'white', fontSize: '16px' }}
            activeStyle={{ fontWeight: 'bold', textDecoration: 'underline' }}
          >
            Profile
          </NavLink>
        </li>
        <li style={{ margin: '0 10px' }}>
          <NavLink
            to="/cv-management"
            style={{ textDecoration: 'none', color: 'white', fontSize: '16px' }}
            activeStyle={{ fontWeight: 'bold', textDecoration: 'underline' }}
          >
            CV Management
          </NavLink>
        </li>
        <li style={{ margin: '0 10px' }}>
          <NavLink
            to="/job-tracker"
            style={{ textDecoration: 'none', color: 'white', fontSize: '16px' }}
            activeStyle={{ fontWeight: 'bold', textDecoration: 'underline' }}
          >
            Job Tracker
          </NavLink>
        </li>
        <li style={{ margin: '0 10px' }}>
          <NavLink
            to="/recruiter-search"
            style={{ textDecoration: 'none', color: 'white', fontSize: '16px' }}
            activeStyle={{ fontWeight: 'bold', textDecoration: 'underline' }}
          >
            Recruiter Search
          </NavLink>
        </li>
        <li style={{ margin: '0 10px' }}>
          <NavLink
            to="/signout"
            style={{ textDecoration: 'none', color: 'white', fontSize: '16px' }}
            activeStyle={{ fontWeight: 'bold', textDecoration: 'underline' }}
          >
            Sign Out
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
