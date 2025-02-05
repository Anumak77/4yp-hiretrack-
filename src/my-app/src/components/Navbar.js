import React from 'react';
import { NavLink } from 'react-router-dom';
import profileIcon from '../images/profile_icon.png'; 
import './style.css'; 

const Navbar = () => {
  return (
    <nav className="navbar">
      <ul className="nav-menu">
        <li className="nav-item">
          <NavLink to="/dashboard_jobseeker" className="nav-link">
            Dashboard JobSeeker
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/jobtracker-jobseeker" className="nav-link">
            Job Tracker JobSeeker
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/job-search" className="nav-link">
            Job Search
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/dashboard-recruiter" className="nav-link">
            Dashboard Recruiter
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/jobtracker-recruiter" className="nav-link">
            Job Tracker Recruiter
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/recruiter-search" className="nav-link">
            Recruiter Search
          </NavLink>
        </li>
      </ul>

    </nav>
  );
};

export default Navbar;
