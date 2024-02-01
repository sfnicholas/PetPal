import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import AltNavbar from "../../components/altnavbar";
import Footer from "../../components/footer";
import { BACKEND_URL } from "../../constants";

const PetUpdate = () => {
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [size, setSize] = useState("");
  const [description, setDescription] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [behavior, setBehavior] = useState("");
  const [specialNeeds, setSpecialNeeds] = useState("");
  const [adoptionFee, setAdoptionFee] = useState("");
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [currentImage1, setCurrentImage1] = useState("");
  const [currentImage2, setCurrentImage2] = useState("");
  const [currentImage3, setCurrentImage3] = useState("");
  const [status, setStatus] = useState("");

  const [formErrors, setFormErrors] = useState([]);
  const [successMsg, setSuccessMsg] = useState(null);
  const navigate = useNavigate();

  const { petId } = useParams();

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/petlistings/${petId}`);
        const petData = response.data;
        console.log(petData);
        setSpecies(petData.species);
        setBreed(petData.breed);
        setName(petData.name);
        setAge(petData.age);
        setGender(petData.gender);
        setSize(petData.size);
        setDescription(petData.description);
        setMedicalHistory(petData.medical_history);
        setBehavior(petData.behavior);
        setSpecialNeeds(petData.special_needs);
        setAdoptionFee(petData.adoption_fee);
        setStatus(petData.status);
        setCurrentImage1(petData.image1);
        setCurrentImage2(petData.image2);
        setCurrentImage3(petData.image3);
        // setImage1, setImage2, setImage3 if you want to show existing images
      } catch (error) {
        console.error("Error fetching pet data:", error);
        setFormErrors(["Failed to fetch pet data"]);
      }
    };

    fetchPetData();
  }, [petId]);

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
      return;
    }

    try {
      const formData = new FormData();
      formData.append("species", species);
      formData.append("breed", breed);
      formData.append("name", name);
      formData.append("age", age);
      formData.append("gender", gender);
      formData.append("size", size);
      formData.append("description", description);
      formData.append("medical_history", medicalHistory);
      formData.append("behavior", behavior);
      formData.append("special_needs", specialNeeds);
      formData.append("adoption_fee", adoptionFee);
      formData.append("status", status);
      if (image1) formData.append("image1", image1);
      if (image2) formData.append("image2", image2);
      if (image3) formData.append("image3", image3);

      const response = await axios.put(
        `${BACKEND_URL}/petlistings/${petId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        setSuccessMsg("Pet listing updated successfully.");
        setFormErrors([]);
        // Optionally navigate to another page
        // navigate("/some-other-path");
      }
    } catch (error) {
      console.error("Update failed", error.response.data);
      setFormErrors(error.response.data || []);
    }
  };

  return (
    <div class="container-fluid page-container bg-light">
      <AltNavbar />
      <div class="container mt-5 bg-light">
        <div class="row justify-content-center m-5">
          <div class="col-md-6 w-50">
            <div class="card">
              <div class="card-header bg-light text-dark text-left">
                <h3>Pet Update Form</h3>
              </div>
              <div class="card-body bg-light">
                <form onSubmit={handleSubmit}>
                  <div class="form-group mt-0">
                    <label htmlFor="species ">Species:</label>
                    <input
                      type="text"
                      className="form-control mt-1"
                      id="species"
                      value={species}
                      onChange={(e) => handleInputChange(e, setSpecies)}
                    />
                  </div>
                  <div class="form-group mt-4">
                    <label htmlFor="breeds">Breed:</label>
                    <input
                      type="text"
                      className="form-control mt-1"
                      id="breeds"
                      value={breed}
                      onChange={(e) => handleInputChange(e, setBreed)}
                    />
                  </div>
                  <div class="form-group mt-4">
                    <label htmlFor="name">Name:</label>
                    <input
                      type="text"
                      className="form-control mt-1"
                      id="name"
                      value={name}
                      onChange={(e) => handleInputChange(e, setName)}
                    />
                  </div>
                  <div class="form-group mt-4">
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
                  <div class="form-group mt-4">
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

                  <div class="form-group mt-4">
                    <div>
                      <label for="image1">Image1:</label>
                      {currentImage1 && <p>Current: {currentImage1}</p>}
                    </div>
                    <input
                      type="file"
                      className="form-control mt-1"
                      id="image1"
                      name="image1"
                      onChange={(e) => handleFileChange(e, setImage1)}
                    />
                  </div>
                  <div class="form-group mt-4">
                    <div>
                      <label for="image2">Image2:</label>
                      {currentImage2 && <p>Current: {currentImage2}</p>}
                    </div>
                    <input
                      type="file"
                      className="form-control mt-1"
                      id="image2"
                      name="image2"
                      onChange={(e) => handleFileChange(e, setImage2)}
                    />
                  </div>
                  <div class="form-group mt-4">
                    <div>
                      <label for="image3">Image3:</label>
                      {currentImage3 && <p>Current: {currentImage3}</p>}
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

export default PetUpdate;
