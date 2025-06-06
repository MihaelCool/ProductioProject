import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import '../Styles/CreateOrder.css';

const CreateOrder = () => {
  const [orderData, setOrderData] = useState({
    title: '',
    description: '',
    customer_name: '',
    customer_contact: '',
    due_date: '',
    priority: 'medium',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setOrderData({ ...orderData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/home');
    } catch (err) {
      console.error('Error creating order:', err);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="create-order-container">
        <h1>Создать заказ</h1>
        <form onSubmit={handleSubmit} className="order-form">
          <label>
            Название:
            <input
              type="text"
              name="title"
              value={orderData.title}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Описание:
            <textarea
              name="description"
              value={orderData.description}
              onChange={handleChange}
            />
          </label>
          <label>
            Имя клиента:
            <input
              type="text"
              name="customer_name"
              value={orderData.customer_name}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Контакт клиента:
            <input
              type="text"
              name="customer_contact"
              value={orderData.customer_contact}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Срок выполнения:
            <input
              type="date"
              name="due_date"
              value={orderData.due_date}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Приоритет:
            <select name="priority" value={orderData.priority} onChange={handleChange}>
              <option value="low">Низкий</option>
              <option value="medium">Средний</option>
              <option value="high">Высокий</option>
            </select>
          </label>
          <div className="form-actions">
            <button type="submit">Создать</button>
            <button type="button" onClick={() => navigate('/home')}>
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrder;