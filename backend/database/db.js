const sqlite3 = require('sqlite3');  // Use require for sqlite3
sqlite3.verbose(); // This will work after requiring sqlite3

const db = new sqlite3.Database('budget.db', (err) => {
  if (err) {
    console.error("Database opening error: ", err.message);
  } 
});

// Create users table if it doesn't exist
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT,
            description TEXT,
            amount REAL,
            date TEXT,
            user_id INTEGER,
            category TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS budgets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT,
            amount REAL,
            user_id INTEGER,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    `);
});

module.exports = db;
