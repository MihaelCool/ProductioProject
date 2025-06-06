import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">ProductionProject</div>
      <div className="hamburger" onClick={toggleMenu}>
        ☰
      </div>
      <ul className={`navbar-menu ${isOpen ? 'open' : ''}`}>
        <li><a href="/home">Главная</a></li>
        <li><a href="/create-order">Создать заказ</a></li>
        <li><a href="/task-list">Список задач</a></li>
        <li><a href="/notifications">Уведомления</a></li>
        <li>
          <a href="/login" onClick={handleLogout}>
            Выйти
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;