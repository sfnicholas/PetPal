import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BACKEND_URL } from '../../constants';
import Footer from '../../components/footer';
import Navbar from '../../components/navbar';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AltNavbar from '../../components/altnavbar';

const ShelterDetail = () => {
    const [shelter, setShelter] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [pets, setPetListings] = useState([]);
    const { username} = useParams();
    const [page, setPage] = useState(1);


    // AIzaSyAorpVO1oTNjz6WTYBDGNjjo2rJea9wa4w&q = api key maps

    const [newRating, setNewRating] = useState(0);

    const handleRatingChange = (e) => {
    setNewRating(parseInt(e.target.value));
    };

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
    const [latitude, setLatitude] = useState(getRandomCoordinate('latitude'));
    const [longitude, setLongitude] = useState(getRandomCoordinate('longitude'));

    // const randomLatitude = getRandomCoordinate('latitude');
    // const randomLongitude = getRandomCoordinate('longitude');

    const fetchComments = async (username, currentPage) => {
        try {
            console.log('Fetching comments for:', username); // Add this line for debugging
            const commentsResponse = await axios.get(`${BACKEND_URL}/shelter/${username}/comments?page=${currentPage}`);
            console.log('Comments response data:', commentsResponse.data); // Add this line for debugging
            if (Array.isArray(commentsResponse.data.results)) {
                setComments(commentsResponse.data.results);
            } else {
                console.error('Comments data is not an array:', commentsResponse.data);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };
    const fetchPetListings = async (shelterId) => {
        try {
            const response = await axios.get(`${BACKEND_URL}/petlistings`);
    
            if (response.status === 200) {
                const filteredPetListings = response.data.results.filter(petListing => petListing.shelter === shelterId);
                console.log("filteredPetListings" , filteredPetListings);
                setPetListings(filteredPetListings);
            } else {
                console.error('Error fetching pet listings:', response.status);
            }
        } catch (error) {
            console.error('Error fetching pet listings:', error);
        }
    };
    useEffect(() => {

        const fetchShelterDetails = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/shelter/${username}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setShelter(data);
                console.log('Shelter data:', data);
            } catch (error) {
                console.error('Error fetching shelter data:', error);
            }
        };
        fetchShelterDetails();
        if(shelter) {
            fetchComments(shelter.username, page);
            console.log('Shelter Username:', shelter.username);
        }
        if(shelter) {
            console.log('Shelter id:', shelter.id);
            fetchPetListings(shelter.id);
        }
    }, [username, shelter, page]);

    const handleNewCommentSubmit = async (e) => {
        e.preventDefault();
        if (!shelter) return;
    
        try {
            const accessToken = localStorage.getItem('accessToken'); 
            if (!accessToken) {
                console.error('No access token available');
                return;
            }
            await axios.post(`${BACKEND_URL}/shelter/${shelter.username}/comments`, 
                { text: newComment },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            setNewComment('');
            fetchComments(shelter.username);
        } catch (error) {
            console.error('Error submitting comment:', error);
        }
    };
    if (!shelter) {
        return <div>Loading...</div>;
    }
    return (
        <div className="container-fluid page-container bg-light">
            <AltNavbar />
            <main>
                <div className="jumbotron text-center mb-4 mt-3">
                    <h1 className="display-4">Welcome to {shelter.username}!</h1>
                    <p className="lead">{shelter.mission_statement}</p>
                </div>

                <div className="container pb-5">
                    <div className="row">
                        <div className="col-md-6 mb-4">
                            <h2>Contact Information</h2>
                            <p>Email: {shelter.email}</p>
                            <p>Phone: {shelter.phone}</p>
                            <p>Address: {shelter.address}</p>
                            <h2>Mission Statement</h2>

                        </div>
                        <div className="col-md-6 mb-4">
                            <h2>Location</h2>
                            <p>{shelter.location}</p>
                            <div
                                className="map-container mt-3"
                                style={{
                                    position: 'relative',
                                    overflow: 'hidden',
                                    paddingTop: '56.25%'
                                }}>
                                <iframe
                                    title="map"
                                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyAorpVO1oTNjz6WTYBDGNjjo2rJea9wa4w&q=${shelter.address}`}
                                    style={{
                                        border: 0,
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%'
                                    }}
                                    loading="lazy"
                                ></iframe>
                            </div>
                        </div>
                    </div>
                    <div className="row">
            {pets.map((pet) => (
              <div key={pet.id} className="col-md-4 mb-4">
                <Link to={`/petdetails/${pet.id}`} key={pet.id} className="col-md-4 mb-4">
                <div className="card">
                  <img
                    src={pet.image1} 
                    className="card-img-top"
                    alt={`Pet: ${pet.image2}`}/>
                  <div className="card-body">
                    <h5 className="card-title">{pet.name}</h5>
                    <p className="card-text">{pet.description}</p>
                    <hr />
                  </div>
                  <div className="card-footer text-muted bg-light rounded-bottom">
                    <i className="fas fa-calendar-alt mr-2"></i> Published on: {2022}
                  </div>
                </div>
                </Link>
              </div>
            ))}
          </div>
            
                <h2>Reviews</h2>
<div className="comments-section my-4 overflow-auto" >
  {comments.length === 0 ? (
    <p>No comments yet. Be the first to comment!</p>
  ) : (
    comments.map(comment => (
      <div key={comment.id} className="comment">
        <p><strong>Username: {comment.username}</strong>: {comment.text}</p>
      </div>
    ))
  )}
  <form onSubmit={handleNewCommentSubmit} className="comment-form">
    <textarea
      value={newComment}
      onChange={(e) => setNewComment(e.target.value)}
      placeholder="Add a comment..."
      className="form-control my-2"
    />
    <div className="d-flex justify-content-between align-items-center mb-5">
      <div className="form-group">
        <label htmlFor="rating">Rating:</label>
        <select
          id="rating"
          value={newRating}
          onChange={handleRatingChange}
          className="form-control"
        >
          <option value={0}>Select rating...</option>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={5}>5</option>
        </select>
      </div>
      <div>
        <button type="submit" className="btn btn-primary">Post Comment</button>
      </div>
    </div>
  </form>
  <div className="pagination-buttons mb-4">
  {page !== 1 && (
    <button onClick={() => setPage(page - 1)} className="btn btn-secondary">
      Previous Page
    </button>
  )}
  {comments.length > 0 && (
    <button onClick={() => setPage(page + 1)} className="btn btn-secondary">
      Next Page
    </button>
  )}
</div>
</div>
                </div>
                {/* Pet Listings displayment, including a link to the detail of the pet using petdetails.js*/}



            </main>
            <Footer />
        </div>
    );
};
export default ShelterDetail;
