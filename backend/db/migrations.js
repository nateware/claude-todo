const fs = require('fs');
const path = require('path');

/**
 * Migration system for SQLite database
 * Tracks which migrations have been applied and applies new ones
 */

/**
 * Initialize migrations table to track applied migrations
 * @param {Database} db - better-sqlite3 database instance
 */
function initMigrationsTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at INTEGER NOT NULL
    );
  `);
}

/**
 * Get list of applied migrations
 * @param {Database} db - better-sqlite3 database instance
 * @returns {Set<string>} Set of applied migration names
 */
function getAppliedMigrations(db) {
  const rows = db.prepare('SELECT name FROM migrations').all();
  return new Set(rows.map(row => row.name));
}

/**
 * Apply a migration file
 * @param {Database} db - better-sqlite3 database instance
 * @param {string} migrationName - Name of migration file
 * @param {string} migrationPath - Path to migration SQL file
 */
function applyMigration(db, migrationName, migrationPath) {
  const sql = fs.readFileSync(migrationPath, 'utf8');

  // Use transaction for atomic migration
  const migrate = db.transaction(() => {
    db.exec(sql);
    db.prepare('INSERT INTO migrations (name, applied_at) VALUES (?, ?)').run(
      migrationName,
      Date.now()
    );
  });

  migrate();
}

/**
 * Apply all pending migrations
 * @param {Database} db - better-sqlite3 database instance
 */
function applyMigrations(db) {
  // Initialize migrations tracking table
  initMigrationsTable(db);

  // Get applied migrations
  const applied = getAppliedMigrations(db);

  // Get migration files from migrations directory
  const migrationsDir = path.join(__dirname, 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
    return; // No migrations to apply
  }

  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Apply in alphabetical order

  // Apply pending migrations
  for (const file of migrationFiles) {
    if (!applied.has(file)) {
      const migrationPath = path.join(migrationsDir, file);
      console.log(`Applying migration: ${file}`);
      applyMigration(db, file, migrationPath);
      console.log(`Migration applied: ${file}`);
    }
  }
}

module.exports = { applyMigrations };
