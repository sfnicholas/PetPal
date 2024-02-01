import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import AltNavbar from "../../components/altnavbar";
import Footer from "../../components/footer";
import { BACKEND_URL } from "../../constants";

const ApplicationCreation = () => {
  const [petid, setPetid] = useState("");

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
          if (userType !== "seeker") {
            navigate("/403");
            return;
          }
        } catch (error) {
          console.error(
            "Error fetching Create Application page:",
            error.response.data
          );
        }
      }
    };

    checkUserAuth();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let errors = [];
    if (!petid) errors.push("Pet ID is required");

    if (errors.length > 0) {
      setFormErrors(errors);
      console.log(formErrors);
      return;
    }
    try {
      const formData = {
        // Populate formData with state values
        pet_listing: petid,
      };

      const link = BACKEND_URL.concat("/applications/new");
      const response = await axios.post(link, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (response.status == 201) {
        setSuccessMsg("Application submitted successfully.");
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
    <div class="container-fluid page-container bg-light">
      <AltNavbar />
      <div class="container mt-5 bg-light">
        <div class="row justify-content-center m-5">
          <div class="col-md-6 w-50">
            <div class="card">
              <div class="card-header bg-light text-dark text-left">
                <h3>Pet Application Form</h3>
              </div>
              <div class="card-body bg-light">
                <form onSubmit={handleSubmit}>
                  {/* Pet ID*/}
                  <div className="form-group mt-0">
                    <label htmlFor="petid">Adopt Pet ID:</label>
                    <input
                      type="text"
                      className="form-control mt-1"
                      id="petid"
                      value={petid}
                      onChange={(e) => setPetid(e.target.value)}
                    />
                  </div>
                  {/* Submit Button */}
                  <button type="submit" className="btn btn-primary mt-4">
                    Submit
                  </button>
                  {/* Errors and Success Message */}
                  {formErrors.length > 0 && (
                    <div className="alert alert-danger" role="alert">
                      {formErrors.map((error, index) => (
                        <p key={index}>{error}</p>
                      ))}
                    </div>
                  )}
                  {successMsg && (
                    <div className="alert alert-success">{successMsg}</div>
                  )}
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

export default ApplicationCreation;
