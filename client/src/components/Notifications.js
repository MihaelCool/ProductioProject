import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/notifications', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setNotifications(res.data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:3000/api/notifications/${id}/read`, 
        { read: true },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setNotifications(notifications.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      ));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  return (
    <div className="notifications">
      <h1 className="page-title">Уведомления</h1>
      {notifications.length === 0 ? (
        <p>Нет уведомлений</p>
      ) : (
        <div className="notification-list">
          {notifications.map((notif) => (
            <div key={notif.id} className={`notification-card ${notif.read ? '' : 'unread'}`}>
              <div className="notification-content">
                <p>{notif.message}</p>
                <span>{new Date(notif.created_at).toLocaleString()}</span>
              </div>
              {!notif.read && (
                <button onClick={() => markAsRead(notif.id)} className="read-btn">
                  ✓
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;