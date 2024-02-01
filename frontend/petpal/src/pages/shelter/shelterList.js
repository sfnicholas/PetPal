import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../../constants';
import Footer from '../../components/footer';
import Navbar from '../../components/navbar';
import { Link } from 'react-router-dom';
import AltNavbar from '../../components/altnavbar';


const ShelterList = () => {
  const [shelters, setShelters] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); 
  const navigate = useNavigate();

  function getRandomCoordinate(type) {
    let min, max;
    if (type === 'latitude') {
        min = -90;
        max = 90;
    } else { // 'longitude'
        min = -180;
        max = 180;
    }
    return Math.random() * (max - min) + min;
}

  // useEffect(() => {
  //   axios.get(`${BACKEND_URL}/shelter/list`, 
  //   {          params: {
  //     page: currentPage,
  //     itemsPerPage: itemsPerPage,
  //   },}
  //   )
  //     .then((response) => {
  //       // setShelters(response.data);
  //       const enrichedShelters = response.data.map(shelter => ({
  //           ...shelter,
  //           location: {
  //             latitude: getRandomCoordinate('latitude'),
  //             longitude: getRandomCoordinate('longitude')
  //           }
  //         }));
  //         setShelters(enrichedShelters);

  //       if ('geolocation' in navigator) {
  //         navigator.geolocation.getCurrentPosition(
  //           (position) => {
  //             const { latitude, longitude } = position.coords;
  //             setUserLocation({ latitude, longitude });
  //             console.log('User location:', userLocation);
  //           },
  //           (error) => {
  //             console.error('Error getting user location:', error);
  //           }
  //         );
  //       } else {
  //         console.error('Geolocation is not available in this browser.');
  //       }
  //     })
  //     .catch((error) => {
  //       console.error('Error fetching shelter list:', error);
  //     });
  // }, []);

  useEffect(() => {
    let isMounted = true; // To prevent state updates after the component has unmounted
  
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
    const fetchShelters = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/shelter/list`, {
          params: {
            page: currentPage,
            itemsPerPage: itemsPerPage,
          },
        });
        console.log("Fetched Shelters:", response.data);
  
        const sheltersWithLocation = await Promise.all(response.data.map(async (shelter) => {
          const location = await getCoordinatesForAddress(shelter.address);
          console.log("location", location);
          return { ...shelter, location };
        }));
  
        if (isMounted) {
          setShelters(sheltersWithLocation);
        }
      } catch (error) {
        console.error('Error fetching shelters:', error);
      }
    };
  
    fetchShelters();
  
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (isMounted) {
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

  
    return () => {
      isMounted = false; // Cleanup function to set isMounted to false when the component unmounts
    };
  }, [currentPage, itemsPerPage]); // Dependencies for useEffect
  
  
  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };
  
  function calculateDistance(shelter) {
    if (!userLocation || !shelter.location) return null;

    const toRad = x => (x * Math.PI) / 180;

    const userLat = userLocation.latitude;
    const userLng = userLocation.longitude;
    const shelterLat = shelter.location.lat;
    const shelterLng = shelter.location.lng;

    const R = 6371; // Earth radius in kilometers
    const dLat = toRad(shelterLat - userLat);
    const dLon = toRad(shelterLng - userLng);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(userLat)) * Math.cos(toRad(shelterLat)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers

    return distance;
}

const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;

const displayedShelters = React.useMemo(() => {
  if (sortByDistance) {
    return [...shelters]
      .filter(shelter => shelter.location && userLocation) // Filter out shelters with no location
      .sort((a, b) => {
        const distanceA = calculateDistance(a) || Infinity; // Use Infinity for missing distances
        const distanceB = calculateDistance(b) || Infinity;
        return distanceA - distanceB;
      });
  } else {
    return shelters.slice(startIndex, endIndex);
  }
}, [shelters, sortByDistance, userLocation, startIndex, endIndex]);


  const handleSortToggle = () => {
    setSortByDistance(!sortByDistance);
  };
  
  return (
    <div className="container-fluid page-container bg-light">
      <AltNavbar />
      <main>
      <div className="container">
          <h2 className="mt-4 mb-3">Shelters</h2>
          <button className="btn btn-primary mb-3" onClick={handleSortToggle}>
            {sortByDistance ? 'Show All' : 'Sort by Distance'}
          </button>
          <ul className="list-group">
            {displayedShelters.map((shelter) => (
              <Link
                key={shelter.pk.user}
                to={`/shelter/${shelter.username}`}
                className="list-group-item"
              >
                <h3 className="mb-0">{shelter.username}</h3>
                <p className="mb-1">Email: {shelter.email}</p>
                {sortByDistance && userLocation && shelter.location && (
                  <p className="mb-0">Distance: {calculateDistance(shelter).toFixed(2)} km</p>
                )}
              </Link>
            ))}
          </ul>
        </div>
      </main>
      <div className="d-flex justify-content-center mt-2">
          <button className="btn btn-outline-secondary me-2 mb-5" onClick={handlePrevPage} disabled={currentPage === 1}>
            Previous Page
          </button>
          <button className="btn btn-outline-secondary mb-5" onClick={handleNextPage}>
            Next Page
          </button>
        </div>
      <Footer />
    </div>
  );
};

export default ShelterList;
