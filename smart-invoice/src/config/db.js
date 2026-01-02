import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '../../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Chyba pripojenia k SQLite:', err.message);
  else console.log('✅ Úspešne pripojené k lokálnej SQLite: ' + dbPath);
});

// Pomocná funkcia pre async/await
db.query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (sql.trim().toUpperCase().startsWith("SELECT")) {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve({ rows });
      });
    } else {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ result: this });
      });
    }
  });
};

db.serialize(() => {
  // 1. Tabuľka pre tvoj profil
  db.run(`CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT, address TEXT, ico TEXT, dic TEXT, 
    ic_dph TEXT, bank_account TEXT, email TEXT
  )`);

  // 2. Tabuľka pre faktúry (TÁTO TI CHÝBALA)
  db.run(`CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT,
    client_name TEXT,
    client_address TEXT,
    client_ico TEXT,
    amount REAL,
    description TEXT,
    is_paid INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Vložíme prázdny profil, ak neexistuje
  db.run(`INSERT OR IGNORE INTO profile (id, name) VALUES (1, '')`);
});

export default db;