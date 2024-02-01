// SeekerPublicProfile.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate  } from 'react-router-dom';
import { BACKEND_URL } from '../../constants';
import AltNavbar from '../../components/altnavbar';
import Footer from '../../components/footer';

const SeekerPublicProfile = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState(null);
  const { username: profileUsername } = useParams();
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();


  useEffect(() => {
    const fetchProfileData = async () => {
      if (!accessToken) {
        navigate('/login');
        return;
      }
      if (accessToken) {
        try {
          const link = BACKEND_URL.concat('/seeker/', profileUsername);
          const response = await axios.get(link, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          const { username, email, pk, avatar, phone, address} = response.data;
          setUsername(username);
          setEmail(email);
          setAvatar(BACKEND_URL.concat(avatar)); 
          setPhone(phone);
          setAddress(address);
        } catch (error) {
          console.error('Error fetching seeker public profile:', error.response.data);
          if (error.response.status === 403) {
            navigate('/403')
            setErrors('You do not have access to this page.');
          } else {
            setErrors('An error occurred while fetching the profile.');
          }
        }
      }
    };

    fetchProfileData();
  }, [accessToken, profileUsername]);

  if (errors) {
    return (
      <div className="container-fluid page-container bg-light">
        <AltNavbar />
        <div className="container mt-4">
          <div className="row">
            <div className="col-md-12 text-center">
              <h2>Error</h2>
              <p>{errors}</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="container-fluid page-container bg-light">
      <AltNavbar />
      <div className="container mt-4">
        <div className="row">
          <div className="col-md-6">
            <h2>{username}'s Public Profile</h2>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                type="text"
                className="form-control"
                id="username"
                value={username}
                readOnly
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={email}
                readOnly
              />
            </div>
            <div className="mb-3">
              <label htmlFor="phone" className="form-label">
                Phone
              </label>
              <input
                type="text"
                className="form-control"
                id="phone"
                value={phone}
                readOnly
              />
            </div>
            <div className="mb-3">
              <label htmlFor="address" className="form-label">
                Address
              </label>
              <input
                type="text"
                className="form-control"
                id="address"
                value={address}
                readOnly
              />
            </div>
          </div>

          <div className="col-md-6 mb-4">
            <div className="card">
              <div className="card-body text-center mb-3">
              <img
                src={avatar || '../../Pictures/Icons/profile_pic.webp'}
                alt="Profile Picture"
                  className="card-img img-thumbnail mb-3"
                  style={{ width: '300px', height: '300px' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SeekerPublicProfile;
