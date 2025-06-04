import React from 'react';
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import TaskList from './components/TaskList';
import Notifications from './components/Notifications';
import CreateOrder from './components/CreateOrder';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="header">
          <div className="header-logo">Auto-Stol LLC</div>
          <div className="header-user">
            Менеджер Иван <button onClick={() => localStorage.removeItem('token')}>Выйти</button>
          </div>
        </header>
        <nav className="sidebar">
          <ul>
            <li><Link to="/home">Главная</Link></li>
            <li><Link to="/create-order">Создать заказ</Link></li>
            <li><Link to="/orders">Список заказов</Link></li>
            <li><Link to="/notifications">Уведомления</Link></li>
          </ul>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/tasks" element={<TaskList />} />
            <Route path="/home" element={<Home />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/create-order" element={<CreateOrder />} />
            <Route path="/orders" element={<TaskList />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;