// Login.js

import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import { BACKEND_URL } from '../../constants'; 


const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const link = BACKEND_URL + '/login';

      const response = await axios.post(link, {
        username,
        password,
      }, {
        headers: {
        }}) ;

      const accessToken = response.data.access;
      const userType = response.data.user_type;

      localStorage.setItem('accessToken', accessToken);

      localStorage.setItem('userType', userType);

      localStorage.setItem('username', username);

      console.log('Login successful', response.data);

      const isLoggedIn = !!accessToken;
      console.log('Is logged in:', isLoggedIn);

      navigate('..');      
    } catch (error) {
      localStorage.clear();
      console.error('Login failed', error.response.data);
      setErrors(error.response.data || {});
    }
  };

  return (
    <div className="container-fluid page-container bg-light">

      <Navbar />

      <div className="container mt-5 bg-light">
        <div className="card">
          <div className="card-header bg-light text-dark text-left">
            <h3>Login</h3>
          </div>
          <div className="card-body bg-light">
          {errors && (
            <div className="alert alert-danger" role="alert">
                {Array.isArray(errors)
                ? errors.map((error, index) => (
                    <div key={index}>{error.message}</div>
                    ))
                : Object.entries(errors).map(([field, messages], index) => (
                    <div key={index}>
                        <strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong>{' '}
                        {Array.isArray(messages) ? messages.join('. ') : messages}
                    </div>
                    ))}
            </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-group mt-0">
                <label htmlFor="email">Username:</label>
                <input
                  type="text"
                  className="form-control mt-1"
                  id="username"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="form-group mt-4">
                <label htmlFor="password">Password:</label>
                <input
                  type="password"
                  className="form-control mt-1"
                  id="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-outline-dark btn-block mt-4">
                Login
              </button>
            </form>
            <p className="mt-3 mb-1">
              Don't have an account? <Link to="/signup">Signup</Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
