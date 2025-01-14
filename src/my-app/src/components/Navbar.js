import React from 'react';
import { NavLink } from 'react-router-dom';
import profileIcon from '../images/profile_icon.png'; 

const Navbar = () => {
  return (
    <nav
      style={{
        backgroundColor: '#ff69b4',
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
          justifyContent: 'space-between', 
          alignItems: 'center',
          listStyle: 'none',
          margin: 0,
          padding: 0,
        }}
      >
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
            to="/dashboard_jobseeker"
            style={{ textDecoration: 'none', color: 'white', fontSize: '16px' }}
            activeStyle={{ fontWeight: 'bold', textDecoration: 'underline' }}
          >
            Dashboard JobSeeker
          </NavLink>
        </li>

        <li style={{ margin: '0 10px' }}>
          <NavLink
            to="/jobtracker-jobseeker"
            style={{ textDecoration: 'none', color: 'white', fontSize: '16px' }}
            activeStyle={{ fontWeight: 'bold', textDecoration: 'underline' }}
          >
            Job Tracker JobSeeker
          </NavLink>
        </li>

        <li style={{ margin: '0 10px' }}>
          <NavLink
            to="/dashboard-recruiter"
            style={{ textDecoration: 'none', color: 'white', fontSize: '16px' }}
            activeStyle={{ fontWeight: 'bold', textDecoration: 'underline' }}
          >
            Dashboard Recruiter
          </NavLink>
        </li>


        <li style={{ margin: '0 10px' }}>
          <NavLink
            to="/jobtracker-recruiter"
            style={{ textDecoration: 'none', color: 'white', fontSize: '16px' }}
            activeStyle={{ fontWeight: 'bold', textDecoration: 'underline' }}
          >
            Job Tracker Recruiter
          </NavLink>
        </li>

        
        <li style={{ margin: '0 10px' }}>
          <NavLink
            to="/recruiter-search-1v"
            style={{ textDecoration: 'none', color: 'white', fontSize: '16px' }}
            activeStyle={{ fontWeight: 'bold', textDecoration: 'underline' }}
          >
            Recruiter Search
          </NavLink>
        </li>
        <li style={{ margin: '0 10px' }}>
          <NavLink to="/profile" > 
          <img
              src={profileIcon}
              alt="Profile Icon"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
              }}
            />
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
