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
    max: 20, // Increased for healthcare workload
    min: 5,  // Keep some connections ready
    acquire: 60000, // Increased timeout for healthcare operations
    idle: 30000,
    evict: 1000 // Check for idle connections every second
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true // Prevent table name pluralization
  },
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false,
    // Add statement timeout for long-running queries
    statement_timeout: 30000,
    // Add idle timeout for connections
    idle_in_transaction_session_timeout: 30000
  },
  retry: {
    max: 5, // Increased retries for healthcare reliability
    match: [
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/,
      /deadlock detected/,
      /could not serialize access/
    ]
  }
});

// Test database connection with timeout
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

// Initialize database connection with retries
const initializeDatabase = async () => {
  const maxRetries = 5;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      await testConnection();
      logger.info('Database initialized successfully');
      return true;
    } catch (error) {
      retries++;
      logger.error(`Failed to initialize database (attempt ${retries}/${maxRetries}):`, error);
      
      if (retries === maxRetries) {
        logger.error('Max retries reached. Failed to initialize database.');
        return false;
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
    }
  }
  
  return false;
};

// Add transaction helper for healthcare operations
const withTransaction = async (callback) => {
  const t = await sequelize.transaction({
    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE // Highest isolation for healthcare data
  });
  
  try {
    const result = await callback(t);
    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

module.exports = sequelize;
module.exports.testConnection = testConnection;
module.exports.initializeDatabase = initializeDatabase;
module.exports.withTransaction = withTransaction;
