const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../medbuddy.sqlite');
const db = new Database(dbPath, { verbose: console.log });

const initDB = () => {
  // Create Users table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password TEXT
    )
  `).run();

  // Create Prescriptions table
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

  console.log("✅ SQLite Database Initialized Successfully");
};

// Mock User "model"
const User = {
  findOne: (query) => {
    let row;
    if (query.$or) {
      const conditions = query.$or.map(q => {
        const key = Object.keys(q)[0];
        return `${key} = ?`;
      }).join(' OR ');
      const values = query.$or.map(q => Object.values(q)[0]);
      row = db.prepare(`SELECT * FROM users WHERE ${conditions}`).get(...values);
    } else {
      const key = Object.keys(query)[0];
      const val = query[key];
      row = db.prepare(`SELECT * FROM users WHERE ${key} = ?`).get(val);
    }
    if (row) return { ...row, _id: row.id };
    return null;
  },
  create: (data) => {
    const { username, email, password } = data;
    const result = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(username, email, password);
    return { id: result.lastInsertRowid, _id: result.lastInsertRowid, ...data };
  }
};

// Mock Prescription "model"
const Prescription = {
  create: (data) => {
    const { userId, originalText, result } = data;
    const info = db.prepare('INSERT INTO prescriptions (userId, originalText, result) VALUES (?, ?, ?)')
      .run(userId, originalText, JSON.stringify(result));
    return { id: info.lastInsertRowid, ...data };
  },
  find: (query) => {
    const userId = query.userId;
    const rows = db.prepare('SELECT * FROM prescriptions WHERE userId = ? ORDER BY createdAt DESC').all(userId);
    return rows.map(r => ({
      ...r,
      result: JSON.parse(r.result)
    }));
  }
};

module.exports = { initDB, User, Prescription };
