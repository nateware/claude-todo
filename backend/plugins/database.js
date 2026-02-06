const fp = require('fastify-plugin');
const { initDatabase } = require('../db/database');

/**
 * Fastify plugin to initialize database and add db decorator
 * Makes database instance available as fastify.db
 */
module.exports = fp(async function (fastify, opts) {
  const dbPath = process.env.DATABASE_PATH || './data/todos.db';

  fastify.log.info(`Initializing database at ${dbPath}`);
  const db = initDatabase(dbPath);

  // Add database instance to fastify
  fastify.decorate('db', db);

  // Close database connection on shutdown
  fastify.addHook('onClose', (instance, done) => {
    fastify.log.info('Closing database connection');
    db.close();
    done();
  });
});
