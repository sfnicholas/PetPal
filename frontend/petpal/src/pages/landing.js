// src/components/LandingPage.js
import React, { useState, useEffect  } from 'react';
import Navbar from '../components/navbar';
import AltNavbar from '../components/altnavbar';
import Footer from '../components/footer';
import { BACKEND_URL } from "../constants";
import axios from "axios";


import { Link } from 'react-router-dom';

const Landing = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [pets, setPets] = useState([]);

    const checkLoginStatus = () => {
        const accessToken = localStorage.getItem('accessToken');
        setIsLoggedIn(!!accessToken);
        console.log('Is logged in:', !!accessToken);
      };
  
    useEffect(() => {
      checkLoginStatus();
      const fetchPets = async () => {
        try {
          const link = BACKEND_URL + "/petlistings";
          const response = await axios.get(link, null);
          setPets(response.data.results);
        } catch (error) {
          console.error(
            "Error fetching pets:",
            error.response?.data || "An error occurred"
          );
        }
      };
      fetchPets();

    }, []);

  return (
        <div className="container-fluid page-container bg-light m-0">
        {isLoggedIn ? <AltNavbar /> : <Navbar />}

          <div id="myCarousel" className="carousel slide" data-ride="carousel">
              <div className="carousel-item active">
              <img src="./Pictures/dogs.jpeg" className="img-responsive" alt="" />
              <div className="d-flex-columns carousel-caption justify-content-center">
                  <h1 className="display-1 fw-bold pb-3">Find your new best friend</h1>
                  <div className="input-group w-50 min-vw-50 mx-auto border-0" action="../Login/login.html" method="GET">
                  <Link
                      name="search"
                      className="form-control p-2 px-3 form-control-lg text-decoration-none text-muted"
                      type="search"
                      placeholder="Search"
                      aria-label="Search"
                      to='petsearch'
                  >
                    Search for a pet!
                    </Link>
                  <span className="input-group-append">
                      <Link className="input-group-text" id="btnGroupAddon2" to="petsearch">
                      <img
                          src="../../Pictures/Icons/search.png"
                          width="35"
                          height="35"
                          className="d-inline-block p-0 m-0"
                          alt=""
                      />
                      </Link>
                  </span>
                  </div>
              </div>
              </div>
          </div>

          <div className="d-flex biggap justify-content-center pb-0">
        <div className="row container pb-3 pt-5 justify-content-center">
          <div className="col-md-3 d-flex justify-content-center pb-3">
            <a
              class="btn btn-lg btn-outline-dark w-75 h-75 p-4 m-3"
              href="petsearch"
              ><img
                src="../../Pictures/Icons/paw.png"
                width="45"
                height="45"
                class="d-inline-block"
                alt=""
              /><br />
              Animals to adopt</a
            >
          </div>
          <div className="col-md-3 d-flex justify-content-center pb-3">
        <Link to="/shelterlist" className="btn btn-lg btn-outline-dark w-75 h-75 p-4 m-3">
          <img src="../../Pictures/Icons/pet-house.png" width="45" height="45" className="d-inline-block" alt="" /><br />
          Shelters and Rescues
        </Link>
      </div>
        </div>
      </div>

        <div className="container mt-0 mb-2 pb-5">
        <div className="row mt-5">
            {pets.slice(0, 4).map((pet) => (
              <div key={pet.id} className="col-md-3">
                <a
                  href={`petdetails/${pet.id}`}
                  className="card-link"
                >
                  <div className="card cardsearch my-2">
                    <img
                      src={pet.image1 || "/path/to/default/image"}
                      className="card-img-top"
                      alt={pet.name}
                    />
                    <div className="card-body text-center">{pet.name}</div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="container-fluid bg-white p-5 mb-5">
            <div className="container">
            <div className="row">
                <div className="col-lg-8 offset-lg-2">
                <h1 className="fw-medium mb-4">About Petfinder</h1>
                <p>
                At PetFinderl, we believe in creating meaningful connections between humans and their furry companions. 
                Our mission is to foster a world where every pet finds its forever home and every pet parent discovers 
                the joy of unconditional love.
              </p>
              <p>
              Passionate about animal welfare, we collaborate with shelters, rescues, and dedicated individuals to provide 
              a platform where every pet, regardless of age or breed, can find a second chance. We tirelessly work towards 
              reducing the number of homeless animals and fostering a world where every furry friend has a place to call home.
              </p>
              <p>
              Every adoption is a unique story waiting to unfold. At PetFinder, we take pride in being a part of countless tales of 
              love, joy, and companionship. Together, let's make a difference in the lives of animals and create lasting bonds 
              that bring happiness to both pets and their human companions.
              </p>

                </div>
            </div>
            </div>
        </div>
        <Footer />

        </div>
  );
};

export default Landing;
