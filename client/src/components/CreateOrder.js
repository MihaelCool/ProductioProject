import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CreateOrder() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [totalCost, setTotalCost] = useState(0);
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [drawing, setDrawing] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('customer_name', customerName);
    formData.append('customer_contact', customerContact);
    formData.append('total_cost', totalCost);
    formData.append('due_date', dueDate);
    formData.append('priority', priority);
    if (drawing) formData.append('drawing', drawing);

    try {
      await axios.post('http://localhost:3000/api/orders', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      navigate('/orders');
    } catch (err) {
      alert('Error creating order: ' + (err.response?.data.error || err.message));
    }
  };

  return (
    <div className="create-order">
      <h1 className="page-title">Создать заказ</h1>
      <form onSubmit={handleSubmit} className="order-form">
        <div className="form-group">
          <label>Название</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Описание</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Имя заказчика</label>
          <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Контакт заказчика</label>
          <input type="text" value={customerContact} onChange={(e) => setCustomerContact(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Общая стоимость</label>
          <input type="number" value={totalCost} onChange={(e) => setTotalCost(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Срок выполнения</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Приоритет</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
          </select>
        </div>
        <div className="form-group">
          <label>Чертеж (PDF/JPG)</label>
          <input type="file" accept=".pdf,.jpg,.jpeg" onChange={(e) => setDrawing(e.target.files[0])} required />
        </div>
        <button type="submit" className="submit-btn">Создать заказ</button>
      </form>
    </div>
  );
}

export default CreateOrder;