// server.js
// Smart Dukaan — Backend API Server
// Node.js + Express + SQLite

const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// =====================================================
// PRODUCTS
// =====================================================

// GET all products
app.get('/api/products', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY id').all();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add new product
app.post('/api/products', (req, res) => {
  try {
    const { name, price, stock, min_stock } = req.body;
    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ error: 'name, price, and stock are required' });
    }
    const result = db.prepare(
      'INSERT INTO products (name, price, stock, min_stock) VALUES (?, ?, ?, ?)'
    ).run(name, price, stock, min_stock || 10);

    const newProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update product (e.g. edit price/stock)
app.put('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, min_stock } = req.body;
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    db.prepare(
      'UPDATE products SET name = ?, price = ?, stock = ?, min_stock = ? WHERE id = ?'
    ).run(
      name ?? existing.name,
      price ?? existing.price,
      stock ?? existing.stock,
      min_stock ?? existing.min_stock,
      id
    );

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE product
app.delete('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM products WHERE id = ?').run(id);
    if (result.changes === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// BILLING
// =====================================================

// POST generate a bill (accepts cart items, deducts stock, saves bill)
app.post('/api/bills', (req, res) => {
  try {
    const { items } = req.body; // [{ product_id, quantity }]
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const getProduct = db.prepare('SELECT * FROM products WHERE id = ?');
    const updateStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
    const insertBill = db.prepare('INSERT INTO bills (total, item_count) VALUES (?, ?)');
    const insertBillItem = db.prepare(
      'INSERT INTO bill_items (bill_id, product_id, product_name, price, quantity) VALUES (?, ?, ?, ?, ?)'
    );

    db.exec('BEGIN');
    try {
      let total = 0;
      const resolvedItems = [];

      // Validate stock first
      for (const item of items) {
        const product = getProduct.get(item.product_id);
        if (!product) throw new Error(`Product ID ${item.product_id} not found`);
        if (product.stock < item.quantity) {
          throw new Error(`Not enough stock for ${product.name} (only ${product.stock} left)`);
        }
        total += product.price * item.quantity;
        resolvedItems.push({ product, quantity: item.quantity });
      }

      const billResult = insertBill.run(total, resolvedItems.length);
      const billId = billResult.lastInsertRowid;

      for (const { product, quantity } of resolvedItems) {
        insertBillItem.run(billId, product.id, product.name, product.price, quantity);
        updateStock.run(quantity, product.id);
      }

      db.exec('COMMIT');
      res.status(201).json({ billId, total, itemCount: resolvedItems.length });
    } catch (innerErr) {
      db.exec('ROLLBACK');
      throw innerErr;
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET recent bills
app.get('/api/bills', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const bills = db.prepare('SELECT * FROM bills ORDER BY id DESC LIMIT ?').all(limit);
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// DASHBOARD / STATS
// =====================================================

app.get('/api/stats', (req, res) => {
  try {
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;

    const lowStock = db.prepare(
      'SELECT * FROM products WHERE stock <= min_stock'
    ).all();

    const today = new Date().toISOString().split('T')[0];
    const todayStats = db.prepare(
      `SELECT COALESCE(SUM(total), 0) as totalSales, COUNT(*) as billCount
       FROM bills WHERE date(created_at) = date(?)`
    ).get(today);

    res.json({
      totalProducts,
      lowStockCount: lowStock.length,
      lowStockItems: lowStock,
      todaySales: todayStats.totalSales,
      todayBillCount: todayStats.billCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// HEALTH CHECK
// =====================================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Smart Dukaan backend is running' });
});

app.listen(PORT, () => {
  console.log(`Smart Dukaan backend running at http://localhost:${PORT}`);
});
