const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../medbuddy.sqlite');
const db = new Database(dbPath);

const initDB = () => {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password TEXT
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS prescriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      originalText TEXT,
      result TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id)
    )
  `).run();
};

module.exports = { db, initDB };
