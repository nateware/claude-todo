const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const { applyMigrations } = require('./migrations');

/**
 * Initialize SQLite database with schema
 * @param {string} dbPath - Path to database file
 * @returns {Database} - Database instance
 */
function initDatabase(dbPath) {
  // Ensure data directory exists
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Create database connection
  const db = new Database(dbPath);

  // A new database gets the current schema directly, so its migrations are already satisfied
  const isNewDb = !db.prepare(
    "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'todos'"
  ).get();

  // Read and execute schema
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schema);

  // Apply any pending migrations
  applyMigrations(db, { baseline: isNewDb });

  return db;
}

module.exports = { initDatabase };
