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
        <div className="row mb-4">
          <div className="col-lg-3 mb-3">
            <div className="card shadow mb-3">
              <div className="card-body">
                <h1 className="mb-4">
                  {name}
                  <h4 className="mt-3">
                    <span className="mr-0">Status: </span>
                    <span className="badge rounded-pill bg-success">
                      {status}!
                    </span>
                  </h4>
                </h1>
                <p className="fs-5">Pet ID: {id}</p>
                <p className="fs-5">Species: {species}</p>
                <p className="fs-5">Breed: {breed}</p>
                <p className="fs-5">Age: {age}</p>
                <p className="fs-5">
                  Gender: {gender === "f" ? "Female" : "Male"}
                </p>
                <p className="fs-5">Size: {size}</p>
              </div>
            </div>

            <div className="card shadow">
              <div className="card-body">
                <h2 className="mb-3">Description</h2>
                <p className="fs-5">{specialNeeds}</p>
              </div>
            </div>
          </div>
          <div className="col-lg-5 mb-3">
            <img
              src={image1}
              alt={`${name}`}
              className="detail-page-main-image h-100 w-100"
            />
          </div>

          <div className="col-lg-4 mb-3">
            <img
              // src="../../Pictures//Icons/shelter_logo.png"
              src={avatar}
              alt="Shelter Logo"
              className="img-fluid petdetail-shelter-image"
            />

            <div className="card shadow">
              <div className="card-body">
                <h2 className="card-title">Adoption Information</h2>
                <p className="fs-5">
                  <strong>Adoption Fee:</strong> ${adoption_fee || 0}
                </p>
                <p className="fs-5">
                  <strong>Adoption Process:</strong> Submit our online form; our
                  team will review and reach out for a quick meet-and-greet.
                </p>
                <p className="fs-5">
                  <strong>Shelter Name: </strong>
                  <a href="../Shelter/shelterdetail.html">{username}</a>|{" "}
                  <span>Email: </span>
                  {email} | <span>Phone: </span> {phone} |{" "}
                  <span>Address: </span> {address}
                </p>

                <Link
                  to="/application/create"
                  className="btn btn-primary btn-block"
                >
                  Adopt Me
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="card shadow mb-5">
          <div className="card-body">
            <div className="container mt-3">
              <ul className="nav nav-tabs h5" id="myTab" role="tablist">
                <li className="nav-item" role="presentation">
                  <a
                    className="nav-link active"
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
                <li className="nav-item h5" role="presentation">
                  <a
                    className="nav-link"
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
                <li className="nav-item h5" role="presentation">
                  <a
                    className="nav-link"
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
              <div className="tab-content mt-3" id="myTabContent">
                <div
                  className="tab-pane fade show active"
                  id="medical-history"
                  role="tabpanel"
                  aria-labelledby="medical-history-tab"
                >
                  <p className="fs-5">{medicalHistory}</p>
                </div>
                <div
                  className="tab-pane fade"
                  id="behavior"
                  role="tabpanel"
                  aria-labelledby="behavior-tab"
                >
                  <p className="fs-5">{behavior}</p>
                </div>
                <div
                  className="tab-pane fade"
                  id="special-needs"
                  role="tabpanel"
                  aria-labelledby="special-needs-tab"
                >
                  <p className="fs-5">{specialNeeds}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row mb-5">
          <div className="col-md-12 mb-3">
            <div className="card shadow">
              <div className="card-body">
                <h2 className="mt-4 mb-4">Photo Gallery</h2>
                <div className="container">
                  <div className="row justify-content-center">
                    <div className="card shadow col-md-8">
                      <div
                        id="petPhotoCarousel"
                        className="carousel slide custom-carousel-height"
                      >
                        <ol className="carousel-indicators">
                          <li
                            data-bs-target="#petPhotoCarousel"
                            data-bs-slide-to="0"
                            className="active"
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
                        <div className="carousel-inner">
                          <div className="carousel-item active">
                            <img
                              src={image1}
                              alt={`${name} Photo1`}
                              className="d-block w-100 img-fluid"
                            />
                          </div>
                          <div className="carousel-item">
                            <img
                              src={image2}
                              alt={`${name} Photo2`}
                              className="d-block w-100"
                            />
                          </div>
                          <div className="carousel-item">
                            <img
                              src={image3}
                              alt={`${name} Photo3`}
                              className="d-block w-100"
                            />
                          </div>
                        </div>
                        <a
                          className="carousel-control-prev"
                          href="#petPhotoCarousel"
                          role="button"
                          data-bs-slide="prev"
                        >
                          <span
                            className="carousel-control-prev-icon"
                            aria-hidden="true"
                          ></span>
                          <span className="visually-hidden">Previous</span>
                        </a>
                        <a
                          className="carousel-control-next"
                          href="#petPhotoCarousel"
                          role="button"
                          data-bs-slide="next"
                        >
                          <span
                            className="carousel-control-next-icon"
                            aria-hidden="true"
                          ></span>
                          <span className="visually-hidden">Next</span>
                        </a>
                      </div>
                      {userType === "shelter" && (
                        <Link
                          to={`/petupdate/${pk}`}
                          className="btn btn-primary btn-block"
                        >
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
