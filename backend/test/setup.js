const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Create isolated test database for each test
 * Uses in-memory database for speed, with option for file-based debugging
 * @param {boolean} inMemory - Use in-memory database (default: true)
 * @returns {Database} - Isolated test database instance
 */
function createTestDb(inMemory = true) {
  const dbPath = inMemory
    ? ':memory:'
    : path.join(os.tmpdir(), `test-${Date.now()}-${Math.random()}.db`);

  const db = new Database(dbPath);

  // Apply schema
  const schema = fs.readFileSync(
    path.join(__dirname, '..', 'db', 'schema.sql'),
    'utf8'
  );
  db.exec(schema);

  return db;
}

/**
 * Seed test database with sample data
 * @param {Database} db - Database instance to seed
 * @param {Array} todos - Array of todo objects to insert
 * @returns {Database} - The database instance
 */
function seedTestDb(db, todos = []) {
  const insert = db.prepare(
    'INSERT INTO todos (text, completed, created_at, sort_order) VALUES (?, ?, ?, ?)'
  );

  todos.forEach((todo, index) => {
    insert.run(
      todo.text,
      todo.completed ? 1 : 0,
      todo.createdAt || Date.now(),
      todo.sortOrder !== undefined ? todo.sortOrder : index
    );
  });

  return db;
}

/**
 * Clean up test database
 * @param {Database} db - Database instance to close
 */
function cleanupTestDb(db) {
  if (db && db.open) {
    db.close();
  }
}

module.exports = { createTestDb, seedTestDb, cleanupTestDb };
