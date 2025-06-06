import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import '../Styles/Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3000/api/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="notifications-container">
        <h1>Уведомления</h1>
        <div className="notifications-list">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div key={notification.id} className="notification-card">
                <p>{notification.message}</p>
                <p className="timestamp">{notification.created_at}</p>
              </div>
            ))
          ) : (
            <p>Нет уведомлений.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;