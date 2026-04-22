const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../db/connection');

// GET all users
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Users');
    res.json({ data: result.recordset });
  } catch (err) {
    console.error('DB error:', err.message);
    // Return mock data if DB not connected (dev mode)
    res.json({
      data: [
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob',   email: 'bob@example.com' }
      ],
      note: 'Mock data — DB not connected'
    });
  }
});

// GET user by ID
router.get('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM Users WHERE id = @id');

    if (!result.recordset.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ data: result.recordset[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create user
router.post('/', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }
  try {
    const pool = await getPool();
    await pool.request()
      .input('name', sql.NVarChar, name)
      .input('email', sql.NVarChar, email)
      .query('INSERT INTO Users (name, email) VALUES (@name, @email)');
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
