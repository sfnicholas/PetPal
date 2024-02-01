import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import AltNavbar from "../../components/altnavbar";
import Footer from "../../components/footer";
import { BACKEND_URL } from "../../constants";

const ApplicationDetail = () => {
  const [petid, setPetid] = useState("");
  const { appId } = useParams();
  const [loading, setLoading] = useState(true);
  const [withdrawn, setWithdrawn] = useState(false); 
  const [approved, setApproved] = useState(false);
  const [denied, setDenied] = useState(false);
  const [userType, setUserType] = useState(""); 
  const [successMsg, setSuccessMsg] = useState(null);
  const [formErrors, setFormErrors] = useState([]);
  const [application, setApplication] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [page, setPage] = useState(1);
  

  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const fetchAppData = async () => {
      try {
        const link = `${BACKEND_URL}/applications/${appId}`;

        const response = await axios.get(link, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        if (response.status == 200) {
          // setSuccessMsg("Grab Application successfully.");
          const petData = response.data;
          setPetid(petData.pet_listing);
          setFormErrors([]);

          const application = response.data;
          const petListingResponse = await axios.get(
            `${BACKEND_URL}/petlistings/${application.pet_listing}`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          const applicantResponse = await axios.get(
            `${BACKEND_URL}/seeker/id/${application.applicant}`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          const shelterResponse = await axios.get(
            `${BACKEND_URL}/shelter/id/${petListingResponse.data.shelter}`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
            if (application.status === "withdraw") {
              setWithdrawn(true);
            } 
            if (application.status === "approve") {
              setApproved(true);
            }
            if (application.status === "denied") {
              setDenied(true);
            }
            setUserType(localStorage.getItem("userType"));
          const applicationDetails = {
            status: application.status,
            petListing: petListingResponse.data,
            applicant: applicantResponse.data,
            shelter: shelterResponse.data,
            application: application.application_id,}
            setApplication(applicationDetails);


        }
        setLoading(false);
        fetchComments(page);

        console.log("response.status", response.status);
      } catch (error) {
        console.error("Error fetching application data:", error);
        setFormErrors(error.response.data || []);
      }
    };

    fetchAppData();

    const checkUserAuth = async () => {
      if (!accessToken) {
        navigate("/login");
        return;
      }
    };

    checkUserAuth();
  }, [appId, page]);

  const withdrawApplication = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.put(
        `${BACKEND_URL}/applications/${appId}`,
        { status: "withdrawn" },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        setSuccessMsg("Application withdrawn successfully.");
        setWithdrawn(true);
      }
    } catch (error) {
      console.error("Error withdrawing application:", error.response?.data);
      setFormErrors(error.response?.data || []);
    }
  };


  const approveApplication = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.put(
        `${BACKEND_URL}/applications/${appId}`,
        { status: "accepted" },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        setSuccessMsg("Application approved successfully.");
        setApproved(true);
      }
    } catch (error) {
      console.error("Error approving application:", error.response?.data);
      setFormErrors(error.response?.data || []);
    }
  };

  const denyApplication = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.put(
        `${BACKEND_URL}/applications/${appId}`,
        { status: "denied" },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        setSuccessMsg("Application denied successfully.");
        setDenied(true);
      }
    } catch (error) {
      console.error("Error denying application:", error.response?.data);
      setFormErrors(error.response?.data || []);
    }
  };
  const fetchComments = async (currentPage) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
  
      const commentsResponse = await axios.get(
        `${BACKEND_URL}/application/${appId}/comments?page=${currentPage}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (Array.isArray(commentsResponse.data.results)) {
        setComments(commentsResponse.data.results);
      } else {
        console.error('Comments data is not an array:', commentsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };
const handleNewCommentSubmit = async (e) => {
  e.preventDefault();

  try {
      const accessToken = localStorage.getItem('accessToken'); 

      await axios.post(`${BACKEND_URL}/application/${appId}/comments`, 
          { text: newComment },
          { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setNewComment('');
      fetchComments();
  } catch (error) {
      console.error('Error submitting comment:', error);
  }
}


  if (loading) {
    return <p>Loading...</p>; // You can customize the loading indicator
  }

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
                
                <form>
                  {/* Pet ID*/}
                  <div className="form-group mt-0">
                    <label htmlFor="petid">Adopt Pet ID:</label>
                    <input
                      type="text"
                      className="form-control mt-1"
                      id="petid"
                      value={petid}
                      readOnly
                    />
                  </div>
                  <ul className="list-group">
                <li key={application.id} className="list-group-item">
                  <p>Status: {application.status}</p>
                  Applicant: 
                <Link to={`/seeker/${application.applicant.username}`} style={{ textDecoration: 'none' }}>
                  {"  "+application.applicant.username + "  "}
                </Link>
                Shelter: 
              <Link to={`/shelter/${application.shelter.username}`} style={{ textDecoration: 'none' }}>
                {"  "+application.shelter.username+ "  "}
              </Link>
              Pet:
              <Link to={`/petdetails/${application.petListing.id}`} style={{ textDecoration: 'none' }}>
                {"  "+application.petListing.name+ "  "}
              </Link>
              Application:
              <Link to={`/application/${application.application}`} style={{ textDecoration: 'none' }}>
                {"  "+application.application}
              </Link>
                </li>
              
            </ul>
                    {!withdrawn && userType === "seeker" && (
                    <button
                      type="button"
                      className="btn btn-danger mt-3"
                      onClick={withdrawApplication}
                    >
                      Withdraw Application
                    </button>
                  )}
                    {!approved && userType === "shelter" && (
                    <button
                      type="button"
                      className="btn btn-danger mt-3"
                      onClick={approveApplication}
                    >
                      Approve Application
                    </button>
                  )}
                     {!denied && userType === "shelter" && (
                    <button
                      type="button"
                      className="btn btn-danger mt-3"
                      onClick={denyApplication}
                    >
                      Deny Application
                    </button>
                  )}           





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
                <div className="comments-section my-5 overflow-auto">
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
      <div>
        <button type="submit" className="btn btn-primary">Post Comment</button>
      </div>
    </div>
  </form>
</div>
<div className="pagination-buttons">
  {page !== 1 && (
    <button onClick={() => setPage(page - 1)} className="btn btn-secondary">
      Previous Page
    </button>
  )}
  {(
    <button onClick={() => setPage(page + 1)} className="btn btn-secondary">
      Next Page
    </button>
  )}
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

export default ApplicationDetail;
