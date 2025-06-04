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
      const res = await axios.post('http://localhost:3000/api/orders', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/orders'); // Предполагаемый маршрут для списка заказов
    } catch (err) {
      alert('Error creating order: ' + (err.response?.data.error || err.message));
    }
  };

  return (
    <div className="container mt-5">
      <h2>Create Order</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Customer Name</label>
          <input type="text" className="form-control" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Customer Contact</label>
          <input type="text" className="form-control" value={customerContact} onChange={(e) => setCustomerContact(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Total Cost</label>
          <input type="number" className="form-control" value={totalCost} onChange={(e) => setTotalCost(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Due Date</label>
          <input type="date" className="form-control" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Priority</label>
          <select className="form-control" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Drawing (PDF/JPG)</label>
          <input type="file" className="form-control" accept=".pdf,.jpg,.jpeg" onChange={(e) => setDrawing(e.target.files[0])} />
        </div>
        <button type="submit" className="btn btn-primary">Create Order</button>
      </form>
    </div>
  );
}

export default CreateOrder;