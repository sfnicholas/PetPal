import React, { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../constants";
import Navbar from "../../components/navbar";
import AltNavbar from "../../components/altnavbar";
import Footer from "../../components/footer";
import { Link, useNavigate } from "react-router-dom";

const PetSearch = () => {
  const [pets, setPets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [filterType, setFilterType] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [shelterDict, setShelterDict] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const checkLoginStatus = () => {
      const accessToken = localStorage.getItem("accessToken");
      setIsLoggedIn(!!accessToken);
      console.log("Is logged in:", !!accessToken);
    };

    const getCoordinatesForAddress = async (address) => {
      const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with your API key
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=AIzaSyAorpVO1oTNjz6WTYBDGNjjo2rJea9wa4w&q`;
    
      try {
        const response = await axios.get(url);
        console.log("API Response for address:", address, response.data); // Log the entire API response
    
        if (!response.data || response.data.status === 'ZERO_RESULTS') {
          console.error('No results found for address:', address);
          return null; // Return null if no coordinates found
        }
    
        return response.data.results[0].geometry.location;
      } catch (error) {
        console.error('Error fetching coordinates:', error);
        return null; // Return null in case of error
      }
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          {
            setUserLocation({ latitude, longitude });
          }
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    } else {
      console.error('Geolocation is not available in this browser.');
    }

    const fetchPets = async () => {
      try {
        const link = `${BACKEND_URL}/petlistings`;
        const params = {
          page: currentPage,
          itemsPerPage: itemsPerPage,
        };
    
        const response = await axios.get(link, { params });
        let fetchedPets = response.data.results;
    
        for (let i = 0; i < fetchedPets.length; i++) {
          const pet = fetchedPets[i];
          const shelterId = pet.shelter;
    
          if (shelterId) {
      
            const shelterEndpoint = `${BACKEND_URL}/shelter/id/${shelterId}`;
            const shelterResponse = await axios.get(shelterEndpoint);
            const shelterAddress = shelterResponse.data.address;
            
            const petWithDistance = { ...pet };
    
            if (shelterAddress) {
              const shelterLocation = await getCoordinatesForAddress(shelterAddress);
              console.log("shelterLocation", shelterLocation);
              if (shelterLocation) {
                console.log("shelterLocation", shelterLocation.lng);
                console.log("userlocatoin", userLocation);
                petWithDistance.distance = calculateDistance(userLocation, shelterLocation);
                console.log("petWithDistance.distance", petWithDistance.distance);
              } else {
                petWithDistance.distance = Infinity;
              }
            } else {
              petWithDistance.distance = Infinity;
            }
    
            fetchedPets[i] = petWithDistance;
          } else {
            pet.distance = Infinity;
          }
        }

        fetchedPets = fetchedPets.sort((a, b) => a.distance - b.distance);
    
        console.log("Fetched Pets:", fetchedPets);
        setPets(fetchedPets);
        console.log(pets.distance)

      } catch (error) {
        console.error("Error fetching pets:", error.response?.data || "An error occurred");
      }
    };
    

    const fetchShelters = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/shelter/list`);
        const shelters = response.data;
        const newShelterDict = {};

        shelters.forEach((shelter) => {
          newShelterDict[shelter.username] = shelter.id;
        });
        setShelterDict(newShelterDict);
      } catch (error) {
        console.error(
          "Error fetching shelters:",
          error.response?.data || "An error occurred"
        );
      }
    };
    console.log("Pets:", pets);

    fetchPets();
    fetchShelters();
    checkLoginStatus();
  }, [
    currentPage,
    itemsPerPage,
    sortOrder,
    filterType,
    filterValue,
    searchQuery,
  ]);

  function calculateDistance(userLocation, shelterLocation) {
    const toRadians = (degrees) => (degrees * Math.PI) / 180;
  
    const lat1 = userLocation.latitude;
    const lon1 = userLocation.longitude;
    const lat2 = shelterLocation.lat;
    const lon2 = shelterLocation.lng;
  
    const earthRadiusKm = 6371; // Radius of the Earth in kilometers
  
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = earthRadiusKm * c;
  
    return distanceKm;
  }
  


  const fetchPetsBasedOnSearch = async () => {
    try {
      const link = BACKEND_URL + "/petlistings";
      const params = {
        page: currentPage,
        itemsPerPage: itemsPerPage,
        search: searchQuery,
      };
      if (sortOrder && sortOrder !== "") {
        params.ordering = sortOrder;
      }
      if (filterType !== "" && filterValue !== "") {
        if (filterType === "shelter") {
          params[filterType] = shelterDict[filterValue];
        } else {
          params[filterType] = filterValue;
        }
      }
      const response = await axios.get(link, { params });
      setPets(response.data.results);
      console.log("Pets:", response.data.results);
    } catch (error) {
      console.error(
        "Error fetching Searched pets:",
        error.response?.data || "An error occurred"
      );
    }
  };
  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handleSearch = (e) => {
    e.preventDefault(); // Prevent the default form submit behavior
    fetchPetsBasedOnSearch();
  };

  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
    setFilterValue(""); // Reset filter value when filter type changes
  };

  const handleFilterValueChange = (e) => {
    const selectedValue = e.target.value;
    if (filterType === "shelter") {
      // If shelter is selected, set filterValue directly as the shelter's ID
      setFilterValue(selectedValue);
    } else {
      setFilterValue(selectedValue);
    }
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const getFilterOptions = () => {
    switch (filterType) {
      case "status":
        return ["available", "adopted", "canceled"];
      case "gender":
        return ["m", "f"];
      case "size":
        return ["S", "M", "L", "XL"];
      case "shelter":
        return Object.keys(shelterDict);
      default:
        return [];
    }
  };

  return (
    <div className="container-fluid page-container bg-light m-0">
      {isLoggedIn ? <AltNavbar /> : <Navbar />}

      <div id="myCarousel" className="carousel slide" data-ride="carousel">
        <div className="carousel-item active">
          <img src="./Pictures/dogs.jpeg" className="img-responsive" alt="" />
          <div className="d-flex-columns carousel-caption justify-content-center">
            <h1 className="display-1 fw-bold pb-3">
              Find your new best friend
            </h1>
            <form
              className="input-group w-50 min-vw-50 mx-auto"
              action="../Login/login.html"
              method="GET"
            >
              <input
                name="search"
                className="form-control p-2 px-3 form-control-lg"
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
            </form>
          </div>
        </div>
      </div>
      <div class="container mb-2 pb-5 biggap">
        <div class="card">
          <div class="card-header bg-light text-dark text-center pt-3">
            <h1 class="fw-light">Search Results</h1>
            <div class="row mt-3">
              <div class="col-md-4">
                <label for="filterType">Filter by:</label>
                <select
                  className="form-select"
                  value={filterType}
                  onChange={handleFilterTypeChange}
                >
                  <option value="">None</option>
                  <option value="status">Status</option>
                  <option value="gender">Gender</option>
                  <option value="size">Size</option>
                  <option value="shelter">Shelter</option>
                </select>
              </div>
              <div class="col-md-4">
                <label for="filterValue">{`${
                  filterType.charAt(0).toUpperCase() + filterType.slice(1)
                } value:`}</label>
                <select
                  className="form-select"
                  value={filterValue}
                  onChange={handleFilterValueChange}
                >
                  <option value="">None</option>
                  {getFilterOptions().map((option) => (
                    <option key={option} value={option}>
                      {filterType === "shelter"
                        ? option
                        : option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
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
                  <option value="age">Age</option>
                  <option value="name">Name</option>
                  <option value="Distancee">Distance</option>
                </select>
              </div>
            </div>
          </div>
          <div className="row mt-5">
  {pets.map((pet) => (
    <div key={pet.id} className="col-md-3">
      <Link to={`/petdetails/${pet.id}`}>
        <div className="card cardsearch my-2">
          <img
            src={pet.image1 || "/path/to/default/image"}
            className="card-img-top"
            alt={pet.name}
          />
          <div className="card-body text-center">
            <h5 className="card-title">{pet.name}</h5>
            {pet.distance !== Infinity && (
              <p className="card-text">
                Distance: {pet.distance} km
              </p>
            )}
          </div>
        </div>
      </Link>
    </div>
  ))}
</div>
          <div className="d-flex justify-content-center">
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
      </div>
      <Footer />
    </div>
  );
};

export default PetSearch;
