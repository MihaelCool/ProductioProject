const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../database');
const router = express.Router();

router.post('/register', (req, res) => {
  const { username, password, role, email } = req.body;
  db.run(
    'INSERT INTO users (username, password, role, email) VALUES (?, ?, ?, ?)',
    [username, password, role, email],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'User registered' });
    }
  );
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, 'secret_key', { expiresIn: '1h' });
    res.json({ token });
  });
});

module.exports = router;