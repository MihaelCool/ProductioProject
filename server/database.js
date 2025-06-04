const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');


const db = new sqlite3.Database(path.join(__dirname, '..', 'dataBase', 'tasks.db'));

db.serialize(() => {



  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('manager', 'programmer', 'operator')),
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      customer_name TEXT,
      customer_contact TEXT,
      status TEXT NOT NULL CHECK (status IN ('new', 'awaiting_payment', 'in_progress_programming', 'awaiting_materials', 'in_progress_manufacturing', 'completed', 'cancelled')),
      manager_id INTEGER NOT NULL,
      programmer_id INTEGER,
      operator_id INTEGER,
      prepayment_confirmed BOOLEAN DEFAULT FALSE,
      total_cost INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      due_date DATETIME,
      priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
      FOREIGN KEY (manager_id) REFERENCES users(id),
      FOREIGN KEY (programmer_id) REFERENCES users(id),
      FOREIGN KEY (operator_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS drawings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      path TEXT NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tap_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      path TEXT NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      processed BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      unit TEXT NOT NULL CHECK (unit IN ('kg', 'm', 'pcs')),
      min_quantity INTEGER DEFAULT 0,
      supplier TEXT,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS order_materials (
      order_id INTEGER NOT NULL,
      material_id INTEGER NOT NULL,
      quantity_required INTEGER NOT NULL,
      quantity_used INTEGER DEFAULT 0,
      PRIMARY KEY (order_id, material_id),
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (material_id) REFERENCES materials(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      order_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      read BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (order_id) REFERENCES orders(id)
    )
  `);


  if (!fs.existsSync('./uploads/drawings')) fs.mkdirSync('./uploads/drawings', { recursive: true });
  if (!fs.existsSync('./uploads/tap_files')) fs.mkdirSync('./uploads/tap_files', { recursive: true });
});


module.exports = db;