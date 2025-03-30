const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

// Create migrations directory if it doesn't exist
const migrationsDir = path.join(__dirname, '../migrations');
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

// Parse database URL for Render
const dbUrl = process.env.DATABASE_URL || 'postgresql://careflow_db_user:rEgSYQde9qf8GwoKCLNWT1HdsWoRjQyj@dpg-cvkmmiodl3ps738an8bg-a/careflow_db';

// Initialize Sequelize with database URL
const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  logging: (msg) => logger.debug(msg),
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true
  },
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
    return true;
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    return false;
  }
};

module.exports = sequelize;
module.exports.testConnection = testConnection;
