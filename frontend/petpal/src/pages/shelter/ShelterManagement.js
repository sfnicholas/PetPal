// 1. Display pet lists for this shelter 2. Link to petcreation.js 3. Manage incomming applications
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BACKEND_URL } from '../../constants';
import Footer from '../../components/footer';
import Navbar from '../../components/navbar';
import axios from 'axios';


const ShelterManagement = () => {
    const [shelter, setShelter] = useState(null);
    const [pets, setPetListings] = useState([]);
    const { username} = useParams();
    const isAuthenticated = localStorage.getItem('accessToken') !== null;
    const [petStatuses, setPetStatuses] = useState({}); // Stores the status of each pet

    const fetchPetListings = async (shelterId) => {
        try {
            const response = await axios.get(`${BACKEND_URL}/petlistings`);
    
            if (response.status === 200) {
                const filteredPetListings = response.data.results.filter(petListing => petListing.shelter === shelterId);
                setPetListings(filteredPetListings);
                console.log('they belong to this shelter:', shelterId);
            } else {
                console.error('Error fetching pet listings:', response.status);
            }
        } catch (error) {
            console.error('Error fetching pet listings:', error);
        }
    };

    const handleStatusChange = async (petId, newStatus) => {
        try {
            const responsetest = await axios.get(`${BACKEND_URL}/petlistings/${petId}`);
            console.log('response', responsetest);
          const accessToken = localStorage.getItem('accessToken'); // Retrieve the access token from local storage
          const response = await axios.put(`${BACKEND_URL}/petlistings/${petId}`, {
            status: newStatus
          }, {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });
      
          console.log('response', response);
          if (response.status === 200) {
            setPetStatuses(prevStatuses => ({
              ...prevStatuses,
              [petId]: newStatus
            }));
          }
        } catch (error) {
          console.error('Error updating pet status:', error);
        }
      };
      

    useEffect(() => {
        const fetchShelterDetails = async () => {
            try {
                console.log("pk", username);
                const response = await fetch(`${BACKEND_URL}/shelter/${username}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setShelter(data);
                console.log("autehnticated", isAuthenticated);
            } catch (error) {
                console.error('Error fetching shelter data:', error);
            }
        };
        fetchShelterDetails();
        if(shelter) {
            fetchPetListings(shelter.id);
        }
    }, [username, shelter, isAuthenticated]);

  return (
    <div className="container-fluid page-container bg-light">
      <Navbar />
      <main>
        <div className="container mt-5">
          <h1>Shelter Management</h1>
            {/* Create a new pet */}
          
            {isAuthenticated && (
  <Link to="/petcreation">
    <button className="btn btn-primary">Create a New Pet</button>
  </Link>
)}     
          {/* Display the list of pets by mapping over pets arrays*/}
          <div className="row">
            {pets.map((pet) => (
              <div key={pet.id} className="col-md-4 mb-4">
                <div className="card">
                <Link to={`/petdetails/${pet.id}`} key={pet.id}>
                  <img
                    src={pet.image1} 
                    className="card-img-top"
                    alt={`Pet: ${pet.image2}`}/> </Link>
                  <div className="card-body">
                    <h5 className="card-title">{pet.name}</h5>
                    <p className="card-text">{pet.description}</p>
                    <hr />
                    <strong>Status: </strong>
                    {isAuthenticated ? ( // Check if the user is authenticated
            <select
              className="form-select rounded-pill"
              value={petStatuses[pet.id] || pet.status}
              onChange={(e) => handleStatusChange(pet.id, e.target.value)}
            >
              <option value="available">Available</option>
              <option value="adopted">Adopted</option>
              <option value="pending">Pending</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          ) : (
            <p>Log in to update the status</p>
          )}
                    <small className="form-text text-muted">
                      Update the status of the pet.
                    </small>
                  </div>
                  <div className="card-footer text-muted bg-light rounded-bottom">
                    <i className="fas fa-calendar-alt mr-2"></i> Published on: {pet.date_created}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
export default ShelterManagement;
