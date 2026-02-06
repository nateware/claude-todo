const fp = require('fastify-plugin');

/**
 * Fastify plugin to configure CORS for frontend communication
 */
module.exports = fp(async function (fastify, opts) {
  fastify.register(require('@fastify/cors'), {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
  });

  fastify.log.info(`CORS enabled for origin: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
