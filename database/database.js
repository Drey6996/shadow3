// database/database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Erro ao conectar ao banco:', err);
  else console.log('Banco SQLite conectado.');
});

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    verificationCode TEXT,
    verified INTEGER DEFAULT 0
  )
`);

module.exports = db;