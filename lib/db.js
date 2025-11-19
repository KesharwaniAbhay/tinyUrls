    // lib/db.js
const mysql = require('mysql2/promise');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL missing in env');
}

const u = new URL(process.env.DATABASE_URL);

const pool = mysql.createPool({
  host: u.hostname,
  port: u.port || 3306,
  user: decodeURIComponent(u.username),
  password: decodeURIComponent(u.password),
  database: u.pathname ? u.pathname.slice(1) : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'Z'
});

module.exports = pool;
