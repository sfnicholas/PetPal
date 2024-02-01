// SeekerPublicProfile.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { BACKEND_URL } from "../../constants";
import AltNavbar from "../../components/altnavbar";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";

const PetDetails = () => {
  const [petDetails, setPetDetails] = useState({});
  const [shelterDetails, setShelterDetails] = useState({});
  const [errors, setErrors] = useState(null);
  const [userType, setUserType] = useState("");
  const { pk } = useParams();
  const accessToken = localStorage.getItem("accessToken");
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const fetchPetData = async () => {
      if (accessToken) {
        setLoggedIn(true);
      }
      try {
        const response = await axios.get(`${BACKEND_URL}/petlistings/${pk}`, {
          // headers: {
          //   Authorization: `Bearer ${accessToken}`,
          // },
        });
        setPetDetails(response.data);
        console.log(response.data.shelter);
        const shelterResponse = await axios.get(
          `${BACKEND_URL}/shelter/id/${response.data.shelter}`
        );
        setShelterDetails(shelterResponse.data);
        // Set the fetched pet details into state
        setUserType(localStorage.getItem("userType"));
      } catch (error) {
        console.error("Error fetching pet details:", error);
        setErrors(
          error.response?.data?.message ||
            "An error occurred while fetching the pet details."
        );
      }
    };

    fetchPetData();
  }, [pk, accessToken]);

  if (errors) {
    return <div>{errors}</div>;
  }
  const {
    id,
    name,
    status,
    species,
    breed,
    age,
    gender,
    size,
    medical_history: medicalHistory,
    behavior,
    special_needs: specialNeeds,
    image1,
    image2,
    image3,
    adoption_fee,
  } = petDetails;

  const { username, email, phone, address, avatar } = shelterDetails;

  return (
    <div className="container-fluid page-container bg-light">
      {loggedIn === false ? <Navbar /> : <AltNavbar />}
      <div className="container mt-4">
        <div class="row mb-4">
          <div class="col-lg-3 mb-3">
            <div class="card shadow mb-3">
              <div class="card-body">
                <h1 class="mb-4">
                  {name}
                  <h4 class="mt-3">
                    <span class="mr-0">Status: </span>
                    <span class="badge rounded-pill bg-success">{status}!</span>
                  </h4>
                </h1>
                <p class="fs-5">Pet ID: {id}</p>
                <p class="fs-5">Species: {species}</p>
                <p class="fs-5">Breed: {breed}</p>
                <p class="fs-5">Age: {age}</p>
                <p class="fs-5">Gender: {gender === "f" ? "Female" : "Male"}</p>
                <p class="fs-5">Size: {size}</p>
              </div>
            </div>

            <div class="card shadow">
              <div class="card-body">
                <h2 class="mb-3">Description</h2>
                <p class="fs-5">{specialNeeds}</p>
              </div>
            </div>
          </div>
          <div class="col-lg-5 mb-3">
            <img
              src={image1}
              alt={`${name}`}
              class="detail-page-main-image h-100 w-100"
            />
          </div>

          <div class="col-lg-4 mb-3">
            <img
              // src="../../Pictures//Icons/shelter_logo.png"
              src={avatar}
              alt="Shelter Logo"
              class="img-fluid petdetail-shelter-image"
            />

            <div class="card shadow">
              <div class="card-body">
                <h2 class="card-title">Adoption Information</h2>
                <p class="fs-5">
                  <strong>Adoption Fee:</strong> ${adoption_fee || 0}
                </p>
                <p class="fs-5">
                  <strong>Adoption Process:</strong> Submit our online form; our
                  team will review and reach out for a quick meet-and-greet.
                </p>
                <p class="fs-5">
                  <strong>Shelter Name: </strong>
                  <a href="../Shelter/shelterdetail.html">{username}</a>|{" "}
                  <span>Email: </span>
                  {email} | <span>Phone: </span> {phone} |{" "}
                  <span>Address: </span> {address}
                </p>

                <Link
                  to="/application/create"
                  class="btn btn-primary btn-block"
                >
                  Adopt Me
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div class="card shadow mb-5">
          <div class="card-body">
            <div class="container mt-3">
              <ul class="nav nav-tabs h5" id="myTab" role="tablist">
                <li class="nav-item" role="presentation">
                  <a
                    class="nav-link active"
                    id="medical-history-tab"
                    data-bs-toggle="tab"
                    href="#medical-history"
                    role="tab"
                    aria-controls="medical-history"
                    aria-selected="true"
                  >
                    Medical History
                  </a>
                </li>
                <li class="nav-item h5" role="presentation">
                  <a
                    class="nav-link"
                    id="behavior-tab"
                    data-bs-toggle="tab"
                    href="#behavior"
                    role="tab"
                    aria-controls="behavior"
                    aria-selected="false"
                  >
                    Behavior
                  </a>
                </li>
                <li class="nav-item h5" role="presentation">
                  <a
                    class="nav-link"
                    id="special-needs-tab"
                    data-bs-toggle="tab"
                    href="#special-needs"
                    role="tab"
                    aria-controls="special-needs"
                    aria-selected="false"
                  >
                    Special Needs & Requirements
                  </a>
                </li>
              </ul>
              <div class="tab-content mt-3" id="myTabContent">
                <div
                  class="tab-pane fade show active"
                  id="medical-history"
                  role="tabpanel"
                  aria-labelledby="medical-history-tab"
                >
                  <p class="fs-5">{medicalHistory}</p>
                </div>
                <div
                  class="tab-pane fade"
                  id="behavior"
                  role="tabpanel"
                  aria-labelledby="behavior-tab"
                >
                  <p class="fs-5">{behavior}</p>
                </div>
                <div
                  class="tab-pane fade"
                  id="special-needs"
                  role="tabpanel"
                  aria-labelledby="special-needs-tab"
                >
                  <p class="fs-5">{specialNeeds}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="row mb-5">
          <div class="col-md-12 mb-3">
            <div class="card shadow">
              <div class="card-body">
                <h2 class="mt-4 mb-4">Photo Gallery</h2>
                <div class="container">
                  <div class="row justify-content-center">
                    <div class="card shadow col-md-8">
                      <div
                        id="petPhotoCarousel"
                        class="carousel slide custom-carousel-height"
                      >
                        <ol class="carousel-indicators">
                          <li
                            data-bs-target="#petPhotoCarousel"
                            data-bs-slide-to="0"
                            class="active"
                          ></li>
                          <li
                            data-bs-target="#petPhotoCarousel"
                            data-bs-slide-to="1"
                          ></li>
                          <li
                            data-bs-target="#petPhotoCarousel"
                            data-bs-slide-to="2"
                          ></li>
                        </ol>
                        <div class="carousel-inner">
                          <div class="carousel-item active">
                            <img
                              src={image1}
                              alt={`${name} Photo1`}
                              class="d-block w-100 img-fluid"
                            />
                          </div>
                          <div class="carousel-item">
                            <img
                              src={image2}
                              alt={`${name} Photo2`}
                              class="d-block w-100"
                            />
                          </div>
                          <div class="carousel-item">
                            <img
                              src={image3}
                              alt={`${name} Photo3`}
                              class="d-block w-100"
                            />
                          </div>
                        </div>
                        <a
                          class="carousel-control-prev"
                          href="#petPhotoCarousel"
                          role="button"
                          data-bs-slide="prev"
                        >
                          <span
                            class="carousel-control-prev-icon"
                            aria-hidden="true"
                          ></span>
                          <span class="visually-hidden">Previous</span>
                        </a>
                        <a
                          class="carousel-control-next"
                          href="#petPhotoCarousel"
                          role="button"
                          data-bs-slide="next"
                        >
                          <span
                            class="carousel-control-next-icon"
                            aria-hidden="true"
                          ></span>
                          <span class="visually-hidden">Next</span>
                        </a>
                      </div>
                      {userType === "shelter" && (
  <Link to={`/petupdate/${pk}`} className="btn btn-primary btn-block">
    Update Pet
  </Link>
)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PetDetails;
