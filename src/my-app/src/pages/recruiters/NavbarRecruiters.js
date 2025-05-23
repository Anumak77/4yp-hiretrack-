import React from 'react';
import { NavLink } from 'react-router-dom';
import '../../components/style.css'; 

const NavbarRecruiters = () => { 
  return (
    <nav className="navbar">
      <ul className="nav-menu">

        <li className="nav-item">
          <NavLink to="/dashboard-recruiter" className="nav-link">
            Dashboard Recruiter
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/viewjobpostings" className="nav-link">
            View Job Posting
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/recruiter-search" className="nav-link">
            Recruiter Search
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/recruiter-calendar" className="nav-link">
            Recruiter Calendar
          </NavLink>
        </li>

      </ul>

    </nav>
  );
};

export default NavbarRecruiters;
