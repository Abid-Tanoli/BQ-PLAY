/**
 * Database Connection Module (PostgreSQL with Knex)
 * Handles database initialization and pool management
 */

const knex = require('knex');
const path = require('path');

let db = null;

/**
 * Initialize database connection
 */
function initializeDB() {
  const env = process.env.NODE_ENV || 'development';
  const config = require('../knexfile.js');
  
  if (!db) {
    db = knex(config[env]);
    console.log(`✓ Database initialized in ${env} mode`);
  }
  
  return db;
}

/**
 * Get database instance
 */
function getDB() {
  if (!db) {
    initializeDB();
  }
  return db;
}

/**
 * Close database connection
 */
async function closeDB() {
  if (db) {
    await db.destroy();
    db = null;
    console.log('✓ Database connection closed');
  }
}

/**
 * Run migrations
 */
async function runMigrations() {
  try {
    const database = getDB();
    console.log('Running migrations...');
    await database.migrate.latest();
    console.log('✓ Migrations completed');
  } catch (error) {
    console.error('✗ Migration error:', error.message);
    throw error;
  }
}

/**
 * Run seeds
 */
async function runSeeds() {
  try {
    const database = getDB();
    console.log('Running seeds...');
    await database.seed.run();
    console.log('✓ Seeds completed');
  } catch (error) {
    console.error('✗ Seed error:', error.message);
    throw error;
  }
}

/**
 * Reset database (drop and recreate)
 */
async function resetDatabase() {
  try {
    const database = getDB();
    console.log('Resetting database...');
    await database.migrate.rollback();
    await database.migrate.latest();
    await database.seed.run();
    console.log('✓ Database reset successfully');
  } catch (error) {
    console.error('✗ Reset error:', error.message);
    throw error;
  }
}

/**
 * Health check
 */
async function healthCheck() {
  try {
    const database = getDB();
    const result = await database.raw('SELECT 1');
    return { status: 'healthy', timestamp: new Date() };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}

module.exports = {
  initializeDB,
  getDB,
  closeDB,
  runMigrations,
  runSeeds,
  resetDatabase,
  healthCheck
};
