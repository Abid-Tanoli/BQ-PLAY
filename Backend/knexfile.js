/**
 * Knex.js Configuration
 * PostgreSQL migration and seed setup for BQ-PLAY
 */

const path = require('path');

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'bq_play_dev'
    },
    migrations: {
      directory: path.join(__dirname, 'migrations'),
      extension: 'js'
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
      extension: 'js'
    },
    pool: { min: 2, max: 10 }
  },

  production: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false }
    },
    migrations: {
      directory: path.join(__dirname, 'migrations'),
      extension: 'js'
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
      extension: 'js',
      loadExtensions: ['.js']
    },
    pool: { min: 2, max: 20 }
  }
};
