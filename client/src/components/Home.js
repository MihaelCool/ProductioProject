import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import '../Styles/Home.css';

const Home = () => {
  const [orders, setOrders] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newOrder, setNewOrder] = useState({
    title: '',
    description: '',
    customer_name: '',
    customer_contact: '',
    status: 'awaiting_payment',
    manager_id: null,
    programmer_id: null,
    operator_id: null,
    prepayment_confirmed: false,
    total_cost: 0,
    due_date: '',
    priority: 'medium',
  });
  const [managers, setManagers] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

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
    const fetchManagers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3000/api/orders/managers', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setManagers(res.data);
      } catch (err) {
        console.error('Error fetching managers:', err);
      }
    };
    fetchOrders();
    fetchManagers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewOrder((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:3000/api/orders', newOrder, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders([...orders, res.data]);
      setIsCreating(false);
      setNewOrder({
        title: '',
        description: '',
        customer_name: '',
        customer_contact: '',
        status: 'awaiting_payment',
        manager_id: null,
        programmer_id: null,
        operator_id: null,
        prepayment_confirmed: false,
        total_cost: 0,
        due_date: '',
        priority: 'medium',
      });
      alert('Заказ создан!');
    } catch (err) {
      console.error('Error creating order:', err);
      alert('Ошибка создания заказа: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleUpdatePrepayment = async (orderId, prepaymentConfirmed) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/orders/${orderId}`,
        { prepayment_confirmed: prepaymentConfirmed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, prepayment_confirmed: prepaymentConfirmed } : order
        )
      );
      setSelectedOrder(null);
      alert('Статус предоплаты обновлён!');
    } catch (err) {
      console.error('Error updating prepayment:', err);
      alert('Ошибка обновления статуса предоплаты.');
    }
  };

  const handleAssignManager = async (orderId, managerId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/orders/${orderId}`,
        { manager_id: managerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, manager_id: managerId } : order
        )
      );
      setSelectedOrder(null);
      alert('Менеджер назначен!');
    } catch (err) {
      console.error('Error assigning manager:', err);
      alert('Ошибка назначения менеджера.');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="home-container">
        <h1>Добро пожаловать!</h1>
        <button onClick={() => setIsCreating(true)} className="create-button">
          Создать заказ
        </button>
        {isCreating && (
          <form onSubmit={handleCreateOrder} className="order-form">
            <label>
              Название:
              <input
                type="text"
                name="title"
                value={newOrder.title}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Описание:
              <textarea
                name="description"
                value={newOrder.description}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Имя заказчика:
              <input
                type="text"
                name="customer_name"
                value={newOrder.customer_name}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Контакт заказчика:
              <input
                type="text"
                name="customer_contact"
                value={newOrder.customer_contact}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Срок выполнения:
              <input
                type="date"
                name="due_date"
                value={newOrder.due_date}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Приоритет:
              <select name="priority" value={newOrder.priority} onChange={handleInputChange}>
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </select>
            </label>
            <label>
              Общая стоимость:
              <input
                type="number"
                name="total_cost"
                value={newOrder.total_cost}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Подтвердить предоплату:
              <input
                type="checkbox"
                name="prepayment_confirmed"
                checked={newOrder.prepayment_confirmed}
                onChange={handleInputChange}
              />
            </label>
            <div className="form-actions">
              <button type="submit">Создать</button>
              <button type="button" onClick={() => setIsCreating(false)}>
                Отмена
              </button>
            </div>
          </form>
        )}
        <div className="orders-list">
          {orders.length > 0 ? (
            orders.map((order) => (
              <div key={order.id} className="order-card" onClick={() => setSelectedOrder(order)}>
                <h3>{order.title}</h3>
                <p>Заказчик: {order.customer_name}</p>
                <p>Статус: {order.status}</p>
                <p>Предоплата: {order.prepayment_confirmed ? 'Да' : 'Нет'}</p>
                <p>Менеджер: {order.manager_id ? `ID ${order.manager_id}` : 'Не назначен'}</p>
              </div>
            ))
          ) : (
            <p>Нет заказов.</p>
          )}
        </div>
        {selectedOrder && (
          <div className="order-details">
            <h2>Детали заказа</h2>
            <p>Название: {selectedOrder.title}</p>
            <p>Описание: {selectedOrder.description}</p>
            <p>Заказчик: {selectedOrder.customer_name}</p>
            <p>Контакт: {selectedOrder.customer_contact}</p>
            <p>Срок: {selectedOrder.due_date}</p>
            <p>Приоритет: {selectedOrder.priority}</p>
            <p>Стоимость: {selectedOrder.total_cost}</p>
            <label>
              Назначить менеджера:
              <select
                value={selectedOrder.manager_id || ''}
                onChange={(e) => handleAssignManager(selectedOrder.id, e.target.value || null)}
              >
                <option value="">Не назначен</option>
                {managers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.username}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Подтвердить предоплату:
              <input
                type="checkbox"
                checked={selectedOrder.prepayment_confirmed}
                onChange={(e) => handleUpdatePrepayment(selectedOrder.id, e.target.checked)}
              />
            </label>
            <button onClick={() => setSelectedOrder(null)}>Закрыть</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;