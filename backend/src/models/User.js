const { db } = require('../config/db');

class User {
  static findOne(query) {
    if (query.$or) {
      const conditions = query.$or.map(q => {
        const key = Object.keys(q)[0];
        return `${key} = ?`;
      }).join(' OR ');
      const values = query.$or.map(q => Object.values(q)[0]);
      const row = db.prepare(`SELECT * FROM users WHERE ${conditions}`).get(...values);
      return row ? { ...row, _id: row.id } : null;
    }
    const key = Object.keys(query)[0];
    const val = query[key];
    const row = db.prepare(`SELECT * FROM users WHERE ${key} = ?`).get(val);
    return row ? { ...row, _id: row.id } : null;
  }

  static create(data) {
    const { username, email, password } = data;
    const info = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(username, email, password);
    return { id: info.lastInsertRowid, _id: info.lastInsertRowid, ...data };
  }
}

module.exports = User;
