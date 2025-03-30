const { Sequelize } = require('sequelize');
const logger = require('./logger');
const path = require('path');
const fs = require('fs');

// Create migrations directory if it doesn't exist
const migrationsDir = path.join(__dirname, '../../migrations');
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

// Parse database URL from environment variable
const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/careflow';

// Initialize Sequelize with connection options
const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: (msg) => logger.debug(msg),
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  retry: {
    max: 3,
    match: [
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/,
      /TimeoutError/,
      /ECONNRESET/,
      /ECONNREFUSED/
    ]
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

// Initialize database with retries
const initializeDatabase = async () => {
  let retries = 3;
  while (retries > 0) {
    try {
      const connected = await testConnection();
      if (connected) {
        return true;
      }
    } catch (error) {
      logger.error(`Database connection attempt failed. Retries left: ${retries - 1}`);
      retries--;
      if (retries === 0) {
        logger.error('Failed to connect to database after all retries');
        return false;
      }
      // Wait for 5 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  return false;
};

// Helper function for transactions
const withTransaction = async (callback) => {
  const t = await sequelize.transaction();
  try {
    const result = await callback(t);
    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// Export everything needed for model initialization
module.exports = {
  sequelize,
  Sequelize,
  testConnection,
  initializeDatabase,
  withTransaction
};
