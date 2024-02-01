import React, { useState, useEffect} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AltNavbar from '../../components/altnavbar';
import Footer from '../../components/footer';
import { BACKEND_URL } from '../../constants';


const formatDateTime = (dateTimeString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
  return new Intl.DateTimeFormat('en-US', options).format(new Date(dateTimeString));
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const link = BACKEND_URL + '/notifications';
        const response = await axios.get(link, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            page: currentPage,
            itemsPerPage: itemsPerPage,
          },
        });

        const unreadNotifications = response.data.results.filter(
          (notification) => notification.status === 'unread'
        );
        const readNotifications = response.data.results.filter(
          (notification) => notification.status === 'read'
        );

        if (statusFilter === 'unread') {
          setNotifications(unreadNotifications);
        } else if (statusFilter === 'read') {
          setNotifications(readNotifications);
        } else {
          setNotifications(response.data.results);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error.response.data);
      }
    };

    fetchNotifications();
  }, [statusFilter, currentPage, itemsPerPage]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const link = `${BACKEND_URL}/notifications/${notificationId}`;
      await axios.put(
        link,
        {
          status: 'read',
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, status: 'read' }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error.response.data);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const link = `${BACKEND_URL}/notifications/${notificationId}`;
      await axios.delete(link, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error.response.data);
    }
  };

  const handleViewNotification = async (notificationId, link) => {
    await handleMarkAsRead(notificationId); 
    navigate(link); 
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  return (
    <div className="container-fluid page-container bg-light">
      <AltNavbar />
      <div className="container mt-4">
        <h2>Notifications</h2>
        <div className="mb-3">
          <label className="form-label">Filter by Status:</label>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
        <ul className="list-group mb-2">
          {notifications.map((notification) => (
            <li key={notification.id} className="list-group-item mb-1">
              <div>
                <strong>Status:</strong> {notification.status}
              </div>
              <div>
                <strong>Message:</strong> {notification.message}
              </div>
              <div>
                <strong>Time:</strong> {formatDateTime(notification.created_at)}
              </div>
              <div>
              <button
                  className="btn btn-sm btn-outline-info"
                  onClick={() => handleViewNotification(notification.id, notification.link)}
                >
                  View Notification
                </button>
                <button
                  className="btn btn-sm btn-outline-primary ms-2"
                  onClick={() => handleMarkAsRead(notification.id)}
                  disabled={notification.status === 'read'}
                >
                  Mark as Read
                </button>
                <button
                  className="btn btn-sm btn-outline-danger ms-2"
                  onClick={() => handleDeleteNotification(notification.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="d-flex justify-content-center">
          <button className="btn btn-outline-secondary me-2 mb-5" onClick={handlePrevPage} disabled={currentPage === 1}>
            Previous Page
          </button>
          <button className="btn btn-outline-secondary mb-5" onClick={handleNextPage}>
            Next Page
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Notifications;
