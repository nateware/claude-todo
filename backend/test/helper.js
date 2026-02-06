'use strict'

// This file contains code that we reuse
// between our tests.

const { build: buildApplication } = require('fastify-cli/helper')
const path = require('node:path')
const AppPath = path.join(__dirname, '..', 'app.js')

// Fill in this config with all the configurations
// needed for testing the application
function config () {
  return {
    skipOverride: true // Register our application with fastify-plugin
  }
}

// automatically build and tear down our instance
async function build (t) {
  // you can set all the options supported by the fastify CLI command
  const argv = [AppPath]

  // fastify-plugin ensures that all decorators
  // are exposed for testing purposes, this is
  // different from the production setup
  const app = await buildApplication(argv, config())

  // close the app after we are done
  t.after(() => app.close())

  return app
}

/**
 * Build app with custom test database
 * @param {object} t - Test context
 * @param {object} testDb - Test database instance
 * @returns {Promise<object>} - Fastify app with test database
 */
async function buildWithTestDb (t, testDb) {
  const app = await build(t)

  // Replace database instance directly (app already has db decorator from plugin)
  // Close the production database that was opened by the plugin
  if (app.db && app.db.open) {
    app.db.close()
  }

  // Replace with test database
  app.db = testDb

  // Clean up test database after test
  t.after(() => {
    if (testDb && testDb.open) {
      testDb.close()
    }
  })

  return app
}

module.exports = {
  config,
  build,
  buildWithTestDb
}
