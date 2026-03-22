const Database = require('better-sqlite3');
const path = require('path');
const { SCHEMA } = require('./schema');

let db;

function getDatabase() {
  if (!db) {
    const dbPath = process.env.DB_PATH || path.join(__dirname, '..', '..', 'volunteer.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.exec(SCHEMA);
  }
  return db;
}

function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { getDatabase, closeDatabase };
