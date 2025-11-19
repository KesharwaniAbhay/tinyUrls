// routes/apiLinks.js
const express = require('express');
const router = express.Router();
const pool = require('../lib/db');

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

async function execute(sql, params) {
  return pool.execute(sql, params || []);
}

// GET /api/links
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT code, target_url, clicks, last_clicked, created_at FROM links ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

// POST /api/links
router.post('/', async (req, res) => {
  const { target_url, code } = req.body || {};
  if (!target_url || typeof target_url !== 'string') return res.status(400).json({ error: 'target_url required' });

  // validate URL
  let parsed;
  try { parsed = new URL(target_url); } catch (e) { return res.status(400).json({ error: 'Invalid target_url' }); }

  let finalCode = code && String(code).trim();
  if (finalCode) {
    if (!CODE_REGEX.test(finalCode)) return res.status(400).json({ error: 'code must match [A-Za-z0-9]{6,8}' });
  } else {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const gen = () => Array.from({length:6}).map(()=>alphabet[Math.floor(Math.random()*alphabet.length)]).join('');
    let tries = 0;
    do {
      finalCode = gen();
      const [rows] = await pool.execute('SELECT 1 FROM links WHERE code = ? LIMIT 1', [finalCode]);
      if (!rows.length) break;
      tries++;
    } while (tries < 10);
    if (!finalCode) return res.status(500).json({ error: 'failed to generate code' });
  }

  try {
    const [result] = await pool.execute('INSERT INTO links (code, target_url) VALUES (?, ?)', [finalCode, parsed.toString()]);
    return res.status(201).json({ code: finalCode, target_url: parsed.toString(), clicks: 0 });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'code already exists' });
    console.error(err);
    return res.status(500).json({ error: 'internal' });
  }
});

// GET /api/links/:code
router.get('/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const [rows] = await pool.execute('SELECT code, target_url, clicks, last_clicked, created_at FROM links WHERE code = ? LIMIT 1', [code]);
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

// DELETE /api/links/:code
router.delete('/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const [result] = await pool.execute('DELETE FROM links WHERE code = ? LIMIT 1', [code]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'not found' });
    return res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

module.exports = router;
