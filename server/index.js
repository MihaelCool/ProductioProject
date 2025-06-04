const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const db = require('./database'); // Подключение базы данных

const app = express();
const port = 3000;

// Настройка multer для обработки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'drawing') cb(null, './uploads/drawings/');
    else if (file.fieldname === 'tap_file') cb(null, './uploads/tap_files/');
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Middleware для обработки JSON
app.use(express.json());

// Статическая служба для доступа к загруженным файлам
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Создание заказа с чертежом
app.post('/api/orders', upload.single('drawing'), (req, res) => {
  const { title, description, customer_name, customer_contact, total_cost, due_date, priority } = req.body;
  const managerId = 1; // Временное значение, заменить на req.user.id при добавлении авторизации

  db.run(
    'INSERT INTO orders (title, description, customer_name, customer_contact, status, manager_id, total_cost, due_date, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [title, description, customer_name, customer_contact, 'awaiting_payment', managerId, total_cost || 0, due_date, priority || 'medium'],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      if (req.file) {
        db.run(
          'INSERT INTO drawings (order_id, filename, path, uploaded_at) VALUES (?, ?, ?, ?)',
          [this.lastID, req.file.filename, `/uploads/drawings/${req.file.filename}`, new Date()],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, filename: req.file.filename });
          }
        );
      } else {
        res.json({ id: this.lastID });
      }
    }
  );
});

// Подтверждение предоплаты
app.put('/api/orders/:id/prepayment', (req, res) => {
  const { prepayment_confirmed } = req.body;
  const managerId = 1; // Временное значение, заменить на req.user.id

  db.get('SELECT * FROM orders WHERE id = ? AND manager_id = ?', [req.params.id, managerId], (err, order) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    db.run(
      'UPDATE orders SET prepayment_confirmed = ?, status = ? WHERE id = ?',
      [prepayment_confirmed, prepayment_confirmed ? 'in_progress_programming' : 'awaiting_payment', req.params.id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      }
    );
  });
});

// Базовый маршрут для проверки работы сервера
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});