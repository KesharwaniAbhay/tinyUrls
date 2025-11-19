// routes/redirect.js
const express = require('express');
const router = express.Router();
const pool = require('../lib/db');
const path = require('path');

router.get('/code/:code', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'code.html'));
});

router.get('/:code', async (req, res) => {
  const { code } = req.params;
  if (['api','healthz','code'].includes(code)) return res.status(404).send('not found');

  try {
    const [rows] = await pool.execute('SELECT target_url FROM links WHERE code = ? LIMIT 1', [code]);
    if (!rows.length) return res.status(404).send('not found');
    const target = rows[0].target_url;

    // update clicks
    try {
      await pool.execute('UPDATE links SET clicks = clicks + 1, last_clicked = CURRENT_TIMESTAMP WHERE code = ?', [code]);
    } catch (e) {
      console.error('click update failed', e);
    }

    return res.redirect(302, target);
  } catch (err) {
    console.error(err);
    res.status(500).send('internal');
  }
});

module.exports = router;
