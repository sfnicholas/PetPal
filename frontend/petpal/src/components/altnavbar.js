// src/components/AltNavbar.js

import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../constants'; 
import NotificationsNavbar from './navbar notifications';

const AltNavbar = () => {
    const navigate = useNavigate();


    const handleLogout = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          const link = BACKEND_URL + '/logout';
          await axios.post(link, null, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
        }        localStorage.removeItem('accessToken');
        localStorage.removeItem('userType');
        localStorage.removeItem('username');
        window.location.reload();
        navigate('..'); 
  
      } catch (error) {
        console.error('Logout failed', error.response.data);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userType');
        localStorage.removeItem('username');
        window.location.reload();
        navigate('/'); 
      }
    };
    const getAccountLink = () => {
      return `/account`;

  };

  
    return (
      <nav className="navbar navbar-expand-sm headercolour">
        <div className="container">
        <Link className="navbar-brand" to="..">
          <img
            src="../Pictures/Icons/pawprint.png"
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
            <ul className="navbar-nav"></ul>
            <ul className="navbar-nav ms-auto">
              <li className="nav-item dropdown mt-1">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <img
                    src="../../Pictures/Icons/notification.png"
                    width="35"
                    height="35"
                    className="d-inline-block ms-3"
                    alt=""
                  />
                </a>
                <NotificationsNavbar />
              </li>
              <li className="nav-item dropdown mt-1">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <img
                    src="../../Pictures/Icons/profile.png"
                    width="40"
                    height="40"
                    className="d-inline-block p-0 m-0 ms-3"
                    alt=""
                  />
                </a>
                <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                  <li>
                            <Link
                                className="dropdown-item"
                                to={getAccountLink()}
                            >
                                Account
                            </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>

                  {localStorage.getItem('userType') === 'shelter' && (
                    <li>
                      <Link className="dropdown-item" to="/petcreation">
                        List your Pet
                      </Link>
                    </li>
                  )}
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                  <button
                    className="dropdown-item"
                    type="button"
                    onClick={handleLogout}
                >
                    Logout
                </button>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  };
  
  export default AltNavbar;