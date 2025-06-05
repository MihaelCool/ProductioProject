const db = require('./database.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

db.serialize(() => {
 // Очистка таблицы
 db.run('DELETE FROM users');

  // Добавление пользователей с индивидуальным хэшированием
  db.run(
    "INSERT INTO users (username, password, role, email, created_at) VALUES (?, ?, ?, ?, ?)",
    ['manager1', bcrypt.hashSync('pass123', 10), 'manager', 'manager1@example.com', '2025-06-04 14:00:00']
  );
  db.run(
    "INSERT INTO users (username, password, role, email, created_at) VALUES (?, ?, ?, ?, ?)",
    ['programmer1', bcrypt.hashSync('pass123', 10), 'programmer', 'programmer1@example.com', '2025-06-04 14:00:00']
  );
  db.run(
    "INSERT INTO users (username, password, role, email, created_at) VALUES (?, ?, ?, ?, ?)",
    ['operator1', bcrypt.hashSync('pass123', 10), 'operator', 'operator1@example.com', '2025-06-04 14:00:00']
  );

  // Добавление материалов
  db.run(
    "INSERT INTO materials (name, quantity, unit, min_quantity, supplier, last_updated) VALUES (?, ?, ?, ?, ?, ?)",
    ['Сталь 45', 100, 'kg', 10, 'ООО Металл', '2025-06-04 14:00:00']
  );
  db.run(
    "INSERT INTO materials (name, quantity, unit, min_quantity, supplier, last_updated) VALUES (?, ?, ?, ?, ?, ?)",
    ['Алюминий', 50, 'kg', 5, 'ООО Алюмин', '2025-06-04 14:00:00']
  );

  // Добавление заказов
  db.run(
    "INSERT INTO orders (title, description, customer_name, customer_contact, status, manager_id, total_cost, created_at, updated_at, due_date, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ['Деталь А', 'Обработка на ЧПУ', 'Иван Иванов', 'ivan@example.com', 'awaiting_payment', 1, 5000, '2025-06-04 14:00:00', '2025-06-04 14:00:00', '2025-06-10', 'medium']
  );
  db.run(
    "INSERT INTO orders (title, description, customer_name, customer_contact, status, manager_id, total_cost, created_at, updated_at, due_date, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ['Деталь Б', 'Требуется срочная обработка', 'Петр Петров', 'petr@example.com', 'in_progress_programming', 1, 3000, '2025-06-04 14:00:00', '2025-06-04 14:00:00', '2025-06-08', 'high']
  );

  // Добавление чертежей
  db.run(
    "INSERT INTO drawings (order_id, filename, path, uploaded_at) VALUES (?, ?, ?, ?)",
    [1, 'drawing_a.pdf', '/uploads/drawings/drawing_a.pdf', '2025-06-04 14:00:00']
  );
  db.run(
    "INSERT INTO drawings (order_id, filename, path, uploaded_at) VALUES (?, ?, ?, ?)",
    [2, 'drawing_b.jpg', '/uploads/drawings/drawing_b.jpg', '2025-06-04 14:00:00']
  );

  // Добавление TAP-файлов
  db.run(
    "INSERT INTO tap_files (order_id, filename, path, uploaded_at, processed) VALUES (?, ?, ?, ?, ?)",
    [2, 'program_b.tap', '/uploads/tap_files/program_b.tap', '2025-06-04 14:00:00', 0]
  );

  // Добавление материалов для заказов
  db.run(
    "INSERT INTO order_materials (order_id, material_id, quantity_required, quantity_used) VALUES (?, ?, ?, ?)",
    [1, 1, 10, 0]
  );
  db.run(
    "INSERT INTO order_materials (order_id, material_id, quantity_required, quantity_used) VALUES (?, ?, ?, ?)",
    [2, 2, 5, 2]
  );

  // Добавление уведомлений
  db.run(
    "INSERT INTO notifications (user_id, order_id, message, created_at) VALUES (?, ?, ?, ?)",
    [1, 1, 'Заказ #1 ожидает предоплату', '2025-06-04 14:00:00']
  );
  db.run(
    "INSERT INTO notifications (user_id, order_id, message, created_at) VALUES (?, ?, ?, ?)",
    [2, 2, 'Заказ #2 в работе', '2025-06-04 14:00:00']
  );

  console.log('Тестовые данные успешно добавлены!');
  db.close();
});

process.on('exit', () => db.close());