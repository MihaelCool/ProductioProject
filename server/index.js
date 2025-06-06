const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const db = require('./database');
const ordersRouter = require('./orders');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Импортируем upload из отдельного модуля
const { upload } = require('./multerConfig');

app.use('/api/orders', ordersRouter);

// Эндпоинт для логина
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', { username, password });
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      console.log('User not found:', username);
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    console.log('User found:', user.username, 'Stored password:', user.password);
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Bcrypt error:', err);
        return res.status(500).json({ error: 'Server error' });
      }
      if (!isMatch) {
        console.log('Password mismatch for user:', username);
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      const token = jwt.sign({ id: user.id, role: user.role }, 'secret_key', { expiresIn: '1h' });
      db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
      res.json({ token });
    });
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));