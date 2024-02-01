import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import { BACKEND_URL } from '../../constants'; 


const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [userType, setUserType] = useState('seeker'); 
  const [phone, setPhone] = useState(''); 
  const [address, setAddress] = useState('');
  const [missionStatement, setMissionStatement] = useState(''); 
  const [errors, setErrors] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const link = BACKEND_URL + '/signup';
      const response = await axios.post(link, {
        email,
        password,
        user_type: userType,
        username,
        phone,
        address,
        missionStatement: userType === 'shelter' ? missionStatement : "", // Only include missionStatement if userType is 'shelter'
      }, {
        headers: {
        }});

      const accessToken = response.data.access;

      localStorage.setItem('accessToken', accessToken);

      localStorage.setItem('userType', userType);

      localStorage.setItem('username', username);
  

      console.log('Signup successful', response.data);

      const isLoggedIn = !!accessToken;
      console.log('Is logged in:', isLoggedIn);

      navigate('..');      
    } catch (error) {
      localStorage.clear();
      console.error('Signup failed', error.response.data);
      setErrors(error.response.data || {});
    }
  };

  return (
    <div class="container-fluid page-container bg-light">

      <Navbar />

      <div className="container mt-5 bg-light">
        <div className="card">
          <div className="card-header bg-light text-dark text-left">
            <h3>Create an Account</h3>
          </div>
          <div className="card-body bg-light">
          {errors && Object.keys(errors).length > 0 && (
              <div className="alert alert-danger" role="alert">
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
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-group mt-0">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  className="form-control mt-1"
                  id="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
              <div className="form-group mt-4">
                <label htmlFor="username">Username:</label>
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
                <label htmlFor="phone">Phone:</label>
                <input
                  type="text"
                  className="form-control mt-1"
                  id="phone"
                  placeholder="Enter phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="form-group mt-4">
                <label htmlFor="address">Address:</label>
                <textarea
                  className="form-control mt-1"
                  id="address"
                  placeholder="Enter address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              {userType === 'shelter' && ( 
                <div className="form-group mt-4">
                  <label htmlFor="missionStatement">Mission Statement:</label>
                  <textarea
                    className="form-control mt-1"
                    id="missionStatement"
                    placeholder="Enter mission statement"
                    value={missionStatement}
                    onChange={(e) => setMissionStatement(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group mt-4">
                <label>User Type:</label>
                <div className="form-check">
                  <input
                    type="radio"
                    id="seeker"
                    name="userType"
                    value="seeker"
                    checked={userType === 'seeker'}
                    onChange={() => setUserType('seeker')}
                    className="form-check-input"
                  />
                  <label htmlFor="seeker" className="form-check-label">
                    Seeker
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="radio"
                    id="shelter"
                    name="userType"
                    value="shelter"
                    checked={userType === 'shelter'}
                    onChange={() => setUserType('shelter')}
                    className="form-check-input"
                  />
                  <label htmlFor="shelter" className="form-check-label">
                    Shelter
                  </label>
                </div>
              </div>
              <button type="submit" className="btn btn-outline-dark btn-block mt-4">
                Signup
              </button>
            </form>
            <p className="mt-3 mb-1">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Signup;
