import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import AltNavbar from "../../components/altnavbar";
import Footer from "../../components/footer";
import { BACKEND_URL } from "../../constants";

const PetCreation = () => {
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [size, setSize] = useState("S");
  // const [colour, setColour] = useState("");
  const [gender, setGender] = useState("m");
  const [description, setDescription] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [behavior, setBehavior] = useState("");
  const [specialNeeds, setSpecialNeeds] = useState("");
  const [adoptionFee, setAdoptionFee] = useState("");
  const [image1, setImage1] = useState("");
  const [image2, setImage2] = useState("");
  const [image3, setImage3] = useState("");
  const [status, setStatus] = useState("available");

  const [successMsg, setSuccessMsg] = useState(null);
  const [formErrors, setFormErrors] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const checkUserAuth = async () => {
      if (!accessToken) {
        navigate("/login");
        return;
      }
      if (accessToken) {
        try {
          const userType = localStorage.getItem("userType");
          console.log("User type:", userType);
          if (userType !== "shelter") {
            console.log("User is not a shelter");
            navigate("/403");
            return;
          }
        } catch (error) {
          console.error(
            "Error fetching shelter creation page:",
            error.response.data
          );
        }
      }
    };

    checkUserAuth();
  }, []);

  const handleInputChange = (e, setState) => {
    setState(e.target.value);
  };

  const handleFileChange = (e, setImage) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let errors = [];
    if (!species) errors.push("Species is required");
    if (!breed) errors.push("Breed is required");
    if (!name) errors.push("Name is required");
    if (!age) errors.push("Age is required");
    if (!gender) errors.push("Gender is required");
    if (!size) errors.push("Size is required");
    // if (!colour) errors.push("Colour is required");
    if (!description) errors.push("Description is required");
    if (!medicalHistory) errors.push("Medical history is required");
    if (!behavior) errors.push("Behavior is required");
    if (!specialNeeds) errors.push("Special needs is required");
    if (!adoptionFee) errors.push("Adoption fee is required");
    if (age && isNaN(age)) errors.push("Age must be a number");
    if (adoptionFee && isNaN(adoptionFee))
      errors.push("Adoption fee must be a number");

    if (errors.length > 0) {
      setFormErrors(errors);
      console.log(formErrors);
      return;
    }
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("age", age);
      formData.append("species", species);
      formData.append("breed", breed);
      formData.append("gender", gender);
      formData.append("size", size);
      // formData.append("colour", colour);
      formData.append("description", description);
      formData.append("medical_history", medicalHistory);
      formData.append("behavior", behavior);
      formData.append("special_needs", specialNeeds);
      formData.append("adoption_fee", adoptionFee);
      formData.append("status", status);
      if (image1) {
        formData.append("image1", image1);
      }
      if (image2) {
        formData.append("image2", image2);
      }
      if (image3) {
        formData.append("image3", image3);
      }
      const link = BACKEND_URL.concat("/petlistings/new");
      const response = await axios.post(link, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (response.status == 201) {
        setSuccessMsg("Pet listing created successfully.");
        setFormErrors([]);
      }
      console.log("response.status", response.status);
      console.log("testing", response.data);
    } catch (error) {
      console.error("Submission failed", error.response.data);
      setFormErrors(error.response.data || []);
    }
  };

  return (
    <div className="container-fluid page-container bg-light">
      <AltNavbar />
      <div className="container mt-5 bg-light">
        <div className="row justify-content-center m-5">
          <div className="col-md-6 w-50">
            <div className="card">
              <div className="card-header bg-light text-dark text-left">
                <h3>Pet Creation Form</h3>
              </div>
              <div className="card-body bg-light">
                <form onSubmit={handleSubmit}>
                  <div className="form-group mt-0">
                    <label htmlFor="species ">Species:</label>
                    <input
                      type="text"
                      className="form-control mt-1"
                      id="species"
                      value={species}
                      onChange={(e) => handleInputChange(e, setSpecies)}
                    />
                  </div>
                  <div className="form-group mt-4">
                    <label htmlFor="breeds">Breed:</label>
                    <input
                      type="text"
                      className="form-control mt-1"
                      id="breeds"
                      value={breed}
                      onChange={(e) => handleInputChange(e, setBreed)}
                    />
                  </div>
                  <div className="form-group mt-4">
                    <label htmlFor="name">Name:</label>
                    <input
                      type="text"
                      className="form-control mt-1"
                      id="name"
                      value={name}
                      onChange={(e) => handleInputChange(e, setName)}
                    />
                  </div>
                  <div className="form-group mt-4">
                    <label htmlFor="age">Age:</label>
                    <input
                      type="text"
                      className="form-control mt-1"
                      id="age"
                      value={age}
                      onChange={(e) => handleInputChange(e, setAge)}
                    />
                  </div>
                  <div className="form-group mt-4">
                    <label htmlFor="gender">Gender:</label>
                    <select
                      className="form-select"
                      id="gender"
                      name="gender"
                      value={gender}
                      onChange={(e) => handleInputChange(e, setGender)}
                    >
                      <option value="m">Male</option>
                      <option value="f">Female</option>
                    </select>
                  </div>
                  <div className="form-group mt-4">
                    <label htmlFor="size">Size:</label>
                    <select
                      className="form-select"
                      id="size"
                      name="size"
                      value={size}
                      onChange={(e) => handleInputChange(e, setSize)}
                    >
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                    </select>
                  </div>
                  {/* <div class="form-group mt-4">
                    <label htmlFor="colour">Colour:</label>
                    <input
                      type="text"
                      className="form-control mt-1"
                      id="colour"
                      value={colour}
                      onChange={(e) => handleInputChange(e, setColour)}
                    />
                  </div> */}
                  <div className="form-group mt-4">
                    <label htmlFor="description">Description:</label>
                    <textarea
                      className="form-control mt-1"
                      id="description"
                      rows="3"
                      placeholder="Enter description..."
                      value={description}
                      onChange={(e) => handleInputChange(e, setDescription)}
                    ></textarea>
                  </div>
                  <div className="form-group mt-4">
                    <label htmlFor="medicalHistory">Medical History:</label>
                    <textarea
                      className="form-control mt-1"
                      id="medicalHistory"
                      rows="3"
                      placeholder="Enter medical history..."
                      value={medicalHistory}
                      onChange={(e) => handleInputChange(e, setMedicalHistory)}
                    ></textarea>
                  </div>
                  <div className="form-group mt-4">
                    <label htmlFor="behavior">Behavior:</label>
                    <textarea
                      className="form-control mt-1"
                      id="behavior"
                      rows="3"
                      placeholder="Enter behavior..."
                      value={behavior}
                      onChange={(e) => handleInputChange(e, setBehavior)}
                    ></textarea>
                  </div>
                  <div className="form-group mt-4">
                    <label htmlFor="specialNeeds">Special Needs:</label>
                    <textarea
                      className="form-control mt-1"
                      id="specialNeeds"
                      rows="3"
                      placeholder="Enter special needs..."
                      value={specialNeeds}
                      onChange={(e) => handleInputChange(e, setSpecialNeeds)}
                    ></textarea>
                  </div>
                  <div className="form-group mt-4">
                    <label htmlFor="adoptionFee">Adoption Fee:</label>
                    <input
                      type="text"
                      className="form-control mt-1"
                      id="adoptionFee"
                      placeholder="Enter adoption fee..."
                      value={adoptionFee}
                      onChange={(e) => handleInputChange(e, setAdoptionFee)}
                    />
                  </div>

                  <div className="form-group mt-4">
                    <div>
                      <label htmlFor="image1">Image1:</label>
                    </div>
                    <input
                      type="file"
                      className="form-control mt-1"
                      id="image1"
                      name="image1"
                      onChange={(e) => handleFileChange(e, setImage1)}
                    />
                  </div>
                  <div className="form-group mt-4">
                    <div>
                      <label htmlFor="image2">Image2:</label>
                    </div>
                    <input
                      type="file"
                      className="form-control mt-1"
                      id="image2"
                      name="image2"
                      onChange={(e) => handleFileChange(e, setImage2)}
                    />
                  </div>
                  <div className="form-group mt-4">
                    <div>
                      <label htmlFor="image3">Image3:</label>
                    </div>
                    <input
                      type="file"
                      className="form-control mt-1"
                      id="image3"
                      name="image3"
                      onChange={(e) => handleFileChange(e, setImage3)}
                    />
                  </div>
                  {formErrors.length > 0 && (
                    <div className="alert alert-danger mt-4" role="alert">
                      <ul>
                        {formErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {successMsg && (
                    <div style={{ color: "green" }}>{successMsg}</div>
                  )}
                  <button
                    type="submit"
                    className="btn btn-outline-dark btn-block mt-4"
                  >
                    Submit
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PetCreation;
