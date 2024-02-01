// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';


const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-sm headercolour">
      <div className="container">
        <Link className="navbar-brand" to="..">
          <img
            src="./Pictures/Icons/pawprint.png"
            width="30"
            height="30"
            className="d-inline-block align-top me-2"
            alt=""
          />
          PetFinder
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link to="/login" className="btn btn-outline-dark px-3 py-2 m-2">
                Login
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/signup" className="btn btn-outline-dark px-3 py-2 m-2">
                Signup
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
