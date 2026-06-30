// db.js
// SQLite database setup using Node.js's built-in "node:sqlite" module
// (available in Node 22.5+). No external native dependency needed.
// Database file "dukaan.db" will be created automatically the first time the server runs.

const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const db = new DatabaseSync(path.join(__dirname, 'dukaan.db'));

// ---------- Tables ----------
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 10,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    total REAL NOT NULL,
    item_count INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bill_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id INTEGER NOT NULL,
    product_id INTEGER,
    product_name TEXT NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    FOREIGN KEY (bill_id) REFERENCES bills(id)
  );
`);

// ---------- Seed default products if table is empty ----------
const countRow = db.prepare('SELECT COUNT(*) as count FROM products').get();
if (countRow.count === 0) {
  const insert = db.prepare(
    'INSERT INTO products (name, price, stock, min_stock) VALUES (?, ?, ?, ?)'
  );
  const seedProducts = [
    ['Tata Salt 1kg', 24, 8, 10],
    ['Parle-G Biscuit', 10, 50, 20],
    ['Surf Excel 1kg', 89, 3, 5],
    ['Maggi 70g', 14, 30, 15],
    ['Amul Butter 500g', 260, 12, 10],
  ];
  for (const row of seedProducts) {
    insert.run(...row);
  }
  console.log('Seeded default products into database.');
}

module.exports = db;

