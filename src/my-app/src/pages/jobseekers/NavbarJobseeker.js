import React from 'react';
import { NavLink } from 'react-router-dom';
import '../../components/style.css'; 

const NavbarJobseeker = () => {
  return (
    <nav className="navbar">
      <ul className="nav-menu">
        <li className="nav-item">
          <NavLink to="/dashboard-jobseeker" className="nav-link">
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

      </ul>

    </nav>
  );
};

export default NavbarJobseeker;
