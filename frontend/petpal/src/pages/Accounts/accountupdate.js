// SeekerProfile.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../constants";
import AltNavbar from "../../components/altnavbar";
import Footer from "../../components/footer";

const Account = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [missionStatement, setMissionStatement] = useState("");
  const [errors, setErrors] = useState(null);
  const [applications, setApplications] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);

  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const fetchProfileData = async () => {
      if (!accessToken) {
        navigate("/login");
        return;
      }
      if (accessToken) {
        try {
          const username = localStorage.getItem("username");
          const userType = localStorage.getItem("userType");
          const link = BACKEND_URL.concat("/", userType, "/", username);
          const response = await axios.get(link, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          const { user, email, pk, avatar, phone, address } = response.data;
          setUsername(username);
          setEmail(email);
          setAvatar(BACKEND_URL.concat(avatar));
          setPhone(phone);
          setAddress(address);
        } catch (error) {
          console.error("Error fetching seeker profile:", error.response.data);
        }
      }
    };
    const fetchApplications = async () => {
      const accessToken = localStorage.getItem("accessToken");
      try {
        const link = BACKEND_URL.concat("/", "applications", "/", "list");
        const params = {
          page: currentPage,
          itemsPerPage: itemsPerPage,
          Authorization: `Bearer ${accessToken}`,
        };
        if (sortOrder && sortOrder !== "") {
          params.ordering = sortOrder;
        }
        if (statusFilter !== "") {
          params["status"] = statusFilter;
        }

        console.log(link, { params });
        const response = await axios.get(link, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params, // Send params separately
        });
        console.log(response.data.results);
        // const response = await axios.get(link, {
        //   headers: {
        //     Authorization: `Bearer ${accessToken}`,
        //   },
        // });

        const detailedApplications = [];

        for (const application of response.data.results) {
          try {
            const petListingResponse = await axios.get(
              `${BACKEND_URL}/petlistings/${application.pet_listing}`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );
            const applicantResponse = await axios.get(
              `${BACKEND_URL}/seeker/id/${application.applicant}`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );
            const shelterResponse = await axios.get(
              `${BACKEND_URL}/shelter/id/${petListingResponse.data.shelter}`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );

            const applicationDetails = {
              status: application.status,
              petListing: petListingResponse.data,
              applicant: applicantResponse.data,
              shelter: shelterResponse.data,
              application: application.application_id,
            };

            detailedApplications.push(applicationDetails);
          } catch (error) {
            console.error(
              "Error fetching application details:",
              error.response?.data || "An error occurred"
            );
          }
        }

        setApplications(detailedApplications);
      } catch (error) {
        console.error(
          "Error fetching applications:",
          error.response?.data || "An error occurred"
        );
      }
    };
    fetchProfileData();
    fetchApplications();
  }, [currentPage, itemsPerPage, sortOrder, statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("phone", phone);
      formData.append("address", address);
      formData.append("mission_statement", missionStatement);
      if (avatar) {
        formData.append("avatar", avatar);
      }
      const username_link = localStorage.getItem("username");
      const link = BACKEND_URL.concat(
        "/",
        localStorage.getItem("userType"),
        "/",
        username_link
      );
      const response = await axios.put(link, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      localStorage.setItem("username", username);

      console.log("Profile update successful", response.data);

      navigate("..");
    } catch (error) {
      console.error("Profile update failed", error.response.data);
      setErrors(error.response.data || {});
    }
  };

  const handleSearch = () => {
    const filteredApplications = applications.filter((application) => {
      // Check if the petListing name includes the searchQuery
      return application.petListing.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    // Update the displayedApplications state with the filtered applications
    setApplications(filteredApplications);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
  };

  const handleDelete = async () => {
    try {
      const username_link = localStorage.getItem("username");
      const link = BACKEND_URL.concat(
        "/",
        localStorage.getItem("userType"),
        "/",
        username_link
      );
      await axios.delete(link, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      localStorage.clear();
      navigate("/");
    } catch (error) {
      console.error("Profile deletion failed", error.response.data);
    }
  };
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const displayedApplications = applications.slice(startIndex, endIndex);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  return (
    <div class="container-fluid page-container bg-light">
      <AltNavbar />
      <div className="container mt-4">
        <div className="row">
          <div className="col-md-6">
            <h2>Your Profile</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
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
                  onChange={(e) => setEmail(e.target.value)}
                  required
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
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="address" className="form-label">
                  Address
                </label>
                <textarea
                  className="form-control"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              {localStorage.getItem("userType") === "shelter" && (
                <div className="mb-3">
                  <label htmlFor="missionStatement" className="form-label">
                    Mission Statement
                  </label>
                  <textarea
                    className="form-control"
                    id="missionStatement"
                    value={missionStatement}
                    onChange={(e) => setMissionStatement(e.target.value)}
                  />
                </div>
              )}
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Update Profile
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-danger m-auto ms-3"
              >
                Delete Account
              </button>
              <Link
                to={`/${localStorage.getItem(
                  "userType"
                )}/${localStorage.getItem("username")}`}
              >
                <button className="btn btn-info m-auto ms-3">
                  Public Profile
                </button>
              </Link>
            </form>
          </div>

          <div className="col-md-6 mb-4">
            <div className="card">
              <div className="card-body text-center mb-3">
                <img
                  src={avatar || "../../Pictures/Icons/profile_pic.webp"}
                  alt="Profile Picture"
                  className="card-img img-thumbnail mb-3"
                  style={{ width: "300px", height: "300px" }}
                />
                <div className="mb-3">
                  <label htmlFor="profilePicture" className="form-label">
                    Upload Profile Picture
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="profilePicture"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container mt-4">
          <h2>Your Applications</h2>
          <div class="row mt-3">
            <div class="col-md-4">
              <label>Filter by Status:</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">None</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="denied">Denied</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
            <div class="col-md-4">
              <label for="sort">Sort by:</label>
              <select
                className="form-select"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="">None</option>
                <option value="creation_time">Creation Time</option>
                <option value="last_update_time">Last Update Time</option>
              </select>
            </div>
            <div class="col-md-4">
              <label for="sort">Search for Pet:</label>
              <div className="input-group">
                <input
                  name="search"
                  className="form-control"
                  type="search"
                  placeholder="Search"
                  aria-label="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="input-group-append">
                  <button
                    className="input-group-text"
                    id="btnGroupAddon2"
                    type="submit"
                    onClick={handleSearch}
                  >
                    <img
                      src="../../Pictures/Icons/search.png"
                      width="35"
                      height="35"
                      className="d-inline-block p-0 m-0"
                      alt=""
                    />
                  </button>
                </span>
              </div>
            </div>
          </div>
          {Array.isArray(applications) && applications.length > 0 ? (
            <ul className="list-group">
              {displayedApplications.map((application) => (
                <li key={application.id} className="list-group-item">
                  <p>Status: {application.status}</p>
                  Applicant:
                  <Link
                    to={`/seeker/${application.applicant.username}`}
                    style={{ textDecoration: "none" }}
                  >
                    {" " + application.applicant.username + " "}
                  </Link>
                  Shelter:
                  <Link
                    to={`/shelter/${application.shelter.username}`}
                    style={{ textDecoration: "none" }}
                  >
                    {" " + application.shelter.username + " "}
                  </Link>
                  Pet:
                  <Link
                    to={`/petdetails/${application.petListing.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    {" " + application.petListing.name + " "}
                  </Link>
                  Application:
                  <Link
                    to={`/application/${application.application}`}
                    style={{ textDecoration: "none" }}
                  >
                    {" " + application.application}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>No applications found.</p>
          )}
        </div>
        <div className="d-flex justify-content-center mt-2">
          <button
            className="btn btn-outline-secondary me-2 mb-5"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            Previous Page
          </button>
          <button
            className="btn btn-outline-secondary mb-5"
            onClick={handleNextPage}
          >
            Next Page
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Account;
