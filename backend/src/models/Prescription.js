const { db } = require('../config/db');

class Prescription {
  static create(data) {
    const { userId, originalText, result } = data;
    const info = db.prepare('INSERT INTO prescriptions (userId, originalText, result) VALUES (?, ?, ?)')
      .run(userId, originalText, JSON.stringify(result));
    return { id: info.lastInsertRowid, ...data };
  }

  static findByUserId(userId) {
    const rows = db.prepare('SELECT * FROM prescriptions WHERE userId = ? ORDER BY createdAt DESC').all(userId);
    return rows.map(r => ({
      ...r,
      result: JSON.parse(r.result)
    }));
  }
}

module.exports = Prescription;
