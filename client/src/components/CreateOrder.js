import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import '../Styles/CreateOrder.css';

const CreateOrder = () => {
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
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setNewOrder((prev) => ({
            ...prev,
            manager_id: payload.id,
          }));
        }
        const res = await axios.get('http://localhost:3000/api/orders/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data.filter(user => ['programmer', 'operator'].includes(user.role)));
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Не удалось загрузить список пользователей.');
      }
    };
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewOrder((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.some(file => file.size > 5 * 1024 * 1024)) {
      setError('Размер файла не должен превышать 5MB!');
      setSelectedFiles([]);
      e.target.value = null;
    } else {
      setError(null);
      setSelectedFiles(files);
      console.log('Selected files:', files.map(file => file.name));
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(newOrder).forEach(([key, value]) => {
      formData.append(key, value);
    });
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    for (let [key, value] of formData.entries()) {
      console.log(`FormData entry: ${key} = ${value}`);
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:3000/api/orders', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Заказ создан!');
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
      setSelectedFiles([]);
      e.target.reset();
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Ошибка создания заказа: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div>
      <Navbar />
      <div className="create-order-container">
        <h1>Создать заказ</h1>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleCreateOrder} className="order-form" encType="multipart/form-data">
          {/* Секция: Информация о заказе */}
          <div className="form-section">
            <h2>Информация о заказе</h2>
            <div className="form-grid">
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
            </div>
            <label className="full-width">
              Описание:
              <textarea
                name="description"
                value={newOrder.description}
                onChange={handleInputChange}
              />
            </label>
          </div>

          {/* Секция: Параметры заказа */}
          <div className="form-section">
            <h2>Параметры заказа</h2>
            <div className="form-grid">
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
              <label className="checkbox-label">
                <span>Подтвердить предоплату:</span>
                <input
                  type="checkbox"
                  name="prepayment_confirmed"
                  checked={newOrder.prepayment_confirmed}
                  onChange={handleInputChange}
                />
              </label>
            </div>
          </div>

          {/* Секция: Исполнители */}
          <div className="form-section">
            <h2>Исполнители</h2>
            <div className="form-grid">
              <label>
                Программист:
                <select name="programmer_id" value={newOrder.programmer_id || ''} onChange={handleInputChange}>
                  <option value="">Не назначен</option>
                  {users.filter(user => user.role === 'programmer').map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Оператор:
                <select name="operator_id" value={newOrder.operator_id || ''} onChange={handleInputChange}>
                  <option value="">Не назначен</option>
                  {users.filter(user => user.role === 'operator').map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Секция: Файлы */}
          <div className="form-section">
            <h2>Файлы</h2>
            <label className="full-width">
              Чертежи (PNG/PDF):
              <input
                type="file"
                name="files"
                multiple
                accept=".png,.jpg,.pdf"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <div className="form-actions">
            <button type="submit">Создать</button>
            <button type="button" onClick={() => window.history.back()}>Отмена</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrder;