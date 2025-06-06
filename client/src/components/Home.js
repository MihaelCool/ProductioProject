import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import '../Styles/Home.css';

const Home = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3000/api/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="home-container">
        <h1>Добро пожаловать!</h1>
        <div className="orders-list">
          {orders.length > 0 ? (
            orders.map((order) => (
              <div key={order.id} className="order-card">
                <h3>{order.title}</h3>
                <p>Статус: {order.status}</p>
                <p>Клиент: {order.customer_name}</p>
                <p>Срок: {order.due_date}</p>
              </div>
            ))
          ) : (
            <p>Нет заказов.</p>
          )}
        </div>
        <div className="action-button">+</div>
      </div>
    </div>
  );
};

export default Home;