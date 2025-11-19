// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const apiLinks = require('./routes/apiLinks');
const redirect = require('./routes/redirect');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// healthz
app.get('/healthz', (req, res) => {
  res.json({ ok: true, version: '1.0' });
});

// static UI
app.use(express.static(path.join(__dirname, 'public')));

// API
app.use('/api/links', apiLinks);

// stats page + redirect
app.use('/', redirect);

// fallback
app.use((req, res) => res.status(404).send('Not Found'));

app.listen(PORT, () => console.log(`TinyLink listening on port ${PORT}`));
