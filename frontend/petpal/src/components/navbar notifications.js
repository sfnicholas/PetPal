import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../constants'; 

const NotificationsNavbar = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
      const fetchNotifications = async () => {
        try {
          const accessToken = localStorage.getItem('accessToken');
          if (accessToken) {
            const link = BACKEND_URL + '/notifications';
            const response = await axios.get(link, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });
            if (response && response.data && response.data.results) {
              const unreadNotifications = response.data.results.filter(
                (notification) => notification.status === 'unread'
              );
              const limitedNotifications = unreadNotifications.slice(0, 5);
              setNotifications(limitedNotifications);
            } else {
              console.error('Unexpected response format:', response);
            }
          }
        } catch (error) {
          console.error('Error fetching notifications:', error.response.data);
        }
      };
  
      fetchNotifications();
    }, []);

    const handleNotificationClick = async (notificationId) => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          await axios.put(`${BACKEND_URL}/notifications/${notificationId}`, {
            status: 'read',
          }, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
  
          setNotifications((prevNotifications) =>
            prevNotifications.filter((notification) => notification.id !== notificationId)
          );
        }
      } catch (error) {
        console.error('Error marking notification as read:', error.response.data);
      }
    };
    const handleDeleteNotification = async (notificationId) => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          await axios.delete(`${BACKEND_URL}/notifications/${notificationId}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
  
          setNotifications((prevNotifications) =>
            prevNotifications.filter((notification) => notification.id !== notificationId)
          );
        }
      } catch (error) {
        console.error('Error deleting notification:', error.response.data);
      }
    };


    return (
        <div>
        {notifications.length > 0 ? (
            <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <div className="notification-item">
                    <Link
                      className="dropdown-item notification-text"
                      to={notification.link}
                      onClick={() => handleNotificationClick(notification.id)}
                    >
                      {notification.message.length > 17
                        ? `${notification.message.slice(0, 17)}...`
                        : notification.message}                        
                        </Link>
                    <button
                      className="btn btn-sm btn-outline-primary ms-3"
                      onClick={() => handleNotificationClick(notification.id)}
                    >
                      Mark as Read
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger ms-1 me-3"
                      onClick={() => handleDeleteNotification(notification.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
                <li>
                  <Link className="dropdown-item" to="/notifications">
                    View All
                  </Link>
                </li>
            </ul>
          ) : (
            <div className="dropdown-menu" aria-labelledby="navbarDropdown">
              <span className="dropdown-item">No new notifications</span>
            </div>
          )}
          </div>
    );
};
export default NotificationsNavbar;