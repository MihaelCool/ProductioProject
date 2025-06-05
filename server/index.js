const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const cors = require('cors');
const db = require('./database');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, 'secret_key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'drawing') {
      cb(null, 'uploads/drawings/');
    } else if (file.fieldname === 'tap_file') {
      cb(null, 'uploads/tap_files/');
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

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
    if (password === user.password) { // Временная замена bcrypt
      const token = jwt.sign({ id: user.id, role: user.role }, 'secret_key', { expiresIn: '1h' });
      db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
      res.json({ token });
    } else {
      console.log('Password mismatch for user:', username);
      return res.status(400).json({ error: 'Invalid credentials' });
    }
  });
});

app.post('/api/orders', authenticateToken, upload.single('drawing'), (req, res) => {
  const { title, description, customer_name, customer_contact, total_cost, due_date, priority } = req.body;
  const drawingPath = req.file ? req.file.path : null;

  db.run(
    `INSERT INTO orders (title, description, customer_name, customer_contact, status, manager_id, total_cost, due_date, priority) 
     VALUES (?, ?, ?, ?, 'awaiting_payment', ?, ?, ?, ?)`,
    [title, description, customer_name, customer_contact, req.user.id, total_cost, due_date, priority],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      const orderId = this.lastID;
      if (drawingPath) {
        db.run(
          'INSERT INTO drawings (order_id, filename, path) VALUES (?, ?, ?)',
          [orderId, req.file.filename, drawingPath],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Order created', orderId });
          }
        );
      } else {
        res.status(201).json({ message: 'Order created', orderId });
      }
    }
  );
});

app.get('/api/orders', authenticateToken, (req, res) => {
  db.all('SELECT * FROM orders', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.put('/api/orders/:id/prepayment', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { prepayment_confirmed } = req.body;

  db.run(
    'UPDATE orders SET prepayment_confirmed = ?, status = ? WHERE id = ?',
    [prepayment_confirmed, 'in_progress_programming', id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Prepayment confirmed' });
    }
  );
});

app.get('/api/notifications', authenticateToken, (req, res) => {
  db.all('SELECT * FROM notifications WHERE user_id = ?', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.put('/api/notifications/:id/read', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('UPDATE notifications SET read = 1 WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Notification marked as read' });
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));