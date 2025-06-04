import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TaskList() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/orders', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setOrders(res.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
      }
    };
    fetchOrders();
  }, []);

  const confirmPrepayment = async (orderId) => {
    try {
      await axios.put(`http://localhost:3000/api/orders/${orderId}/prepayment`, 
        { prepayment_confirmed: true },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, prepayment_confirmed: true, status: 'in_progress_programming' } : order
      ));
    } catch (err) {
      alert('Error confirming prepayment: ' + (err.response?.data.error || err.message));
    }
  };

  return (
    <div className="task-list">
      <h1 className="page-title">Список заказов</h1>
      {orders.length === 0 ? (
        <p>Нет заказов</p>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Статус</th>
              <th>Стоимость</th>
              <th>Срок</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.title}</td>
                <td className={`status-${order.status}`}>
                  {order.status === 'awaiting_payment' ? 'Ожидает оплаты' :
                   order.status === 'in_progress_programming' ? 'Программирование' :
                   order.status === 'completed' ? 'Завершён' : order.status}
                </td>
                <td>{order.total_cost} руб.</td>
                <td>{order.due_date || 'Нет'}</td>
                <td>
                  {order.status === 'awaiting_payment' && (
                    <button 
                      onClick={() => confirmPrepayment(order.id)} 
                      className="action-btn"
                    >
                      Подтвердить предоплату
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TaskList;