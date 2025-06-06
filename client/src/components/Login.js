import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Styles/Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3000/api/login', { username, password });
      localStorage.setItem('token', res.data.token);
      navigate('/home');
    } catch (err) {
      console.error('Login error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      alert('Login failed: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="login-container">
      <h1>Вход в систему</h1>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Войти</button>
      </form>
    </div>
  );
}

export default Login;