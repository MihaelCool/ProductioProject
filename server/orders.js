const express = require('express');
const router = express.Router();
const db = require('./database');
const path = require('path');

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  require('jsonwebtoken').verify(token, 'secret_key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Импортируем upload из отдельного модуля
const { upload } = require('./multerConfig');

// Создание заказа с файлами
router.post('/', authenticateToken, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const {
      title,
      description,
      customer_name,
      customer_contact,
      status,
      programmer_id,
      operator_id,
      prepayment_confirmed,
      total_cost,
      due_date,
      priority,
    } = req.body;
    const files = req.files || [];

    console.log('Creating order with data:', req.body);
    console.log('Uploaded files:', files.map(file => file.filename));

    const effectiveManagerId = req.user.id;
    db.run(
      `INSERT INTO orders (title, description, customer_name, customer_contact, status, manager_id, programmer_id, operator_id, prepayment_confirmed, total_cost, created_at, updated_at, due_date, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?)`,
      [
        title,
        description,
        customer_name,
        customer_contact,
        status,
        effectiveManagerId,
        programmer_id || null,
        operator_id || null,
        prepayment_confirmed ? 1 : 0,
        parseInt(total_cost, 10) || 0,
        due_date,
        priority,
      ],
      function (err) {
        if (err) {
          console.error('SQL error creating order:', err.message);
          return res.status(500).json({ error: err.message });
        }
        const orderId = this.lastID;

        // Добавляем файлы в таблицу drawings
        const insertDrawings = db.prepare(
          `INSERT INTO drawings (order_id, filename, path, uploaded_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`
        );
        files.forEach(file => {
          insertDrawings.run(orderId, file.filename, file.path); // Используем file.path напрямую
        });
        insertDrawings.finalize();

        console.log('Order created with ID:', orderId);
        res.json({ id: orderId, ...req.body, drawings: files.map(file => file.filename) });
      }
    );
  });
});

// Остальные маршруты остаются без изменений
router.get('/', authenticateToken, (req, res) => {
  console.log('Fetching all orders for user ID:', req.user.id);
  db.all('SELECT * FROM orders', [], (err, rows) => {
    if (err) {
      console.error('SQL error fetching orders:', err.message);
      return res.status(500).json({ error: err.message });
    }
    console.log('Orders fetched:', rows.length);
    res.json(rows);
  });
});

router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { prepayment_confirmed, manager_id } = req.body;
  const updates = {};
  if (prepayment_confirmed !== undefined) updates.prepayment_confirmed = prepayment_confirmed;
  if (manager_id !== undefined) updates.manager_id = manager_id;

  if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No updates provided' });

  const setClause = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(', ');
  const values = [...Object.values(updates), id];

  console.log('Updating order ID:', id, 'with data:', updates);
  db.run(
    `UPDATE orders SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    values,
    (err) => {
      if (err) {
        console.error('SQL error updating order:', err.message);
        return res.status(500).json({ error: err.message });
      }
      console.log('Order updated:', id);
      res.json({ message: 'Order updated' });
    }
  );
});

router.get('/users', authenticateToken, (req, res) => {
  console.log('Fetching users for user ID:', req.user.id);
  db.all('SELECT id, username, role FROM users WHERE role IN (?, ?)', ['programmer', 'operator'], (err, rows) => {
    if (err) {
      console.error('SQL error fetching users:', err.message);
      return res.status(500).json({ error: err.message });
    }
    console.log('Users fetched:', rows.length);
    res.json(rows);
  });
});

router.get('/managers', authenticateToken, (req, res) => {
  console.log('Fetching managers for user:', req.user.id);
  db.all('SELECT id, username FROM users WHERE role = ?', ['manager'], (err, rows) => {
    if (err) {
      console.error('SQL error fetching managers:', err.message);
      return res.status(500).json({ error: err.message });
    }
    console.log('Managers fetched:', rows.length);
    res.json(rows);
  });
});

module.exports = router;