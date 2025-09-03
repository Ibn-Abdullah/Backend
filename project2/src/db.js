// db.js
import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync(":memory:");

// users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )
`);

// todos table
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    task TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`);

export default db;
