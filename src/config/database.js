const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

// Create migrations directory if it doesn't exist
const migrationsDir = path.join(__dirname, '../migrations');
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

// Get database configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'careflow_db',
  username: process.env.DB_USER || 'careflow_db_user',
  password: process.env.DB_PASSWORD,
  dialect: 'postgres'
};

// Parse DATABASE_URL if provided (Render's default)
let dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  // Construct database URL from individual parameters
  if (!dbConfig.password) {
    throw new Error('Database password is required. Please set DB_PASSWORD or DATABASE_URL environment variable.');
  }
  dbUrl = `postgresql://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`;
}

// Initialize Sequelize with database URL
const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  logging: (msg) => logger.debug(msg),
  pool: {
    max: parseInt(process.env.DB_POOL_MAX) || 20,
    min: parseInt(process.env.DB_POOL_MIN) || 5,
    acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 60000,
    idle: parseInt(process.env.DB_POOL_IDLE) || 30000,
    evict: parseInt(process.env.DB_POOL_EVICT) || 1000
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  },
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false,
    statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT) || 30000,
    idle_in_transaction_session_timeout: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000
  },
  retry: {
    max: parseInt(process.env.DB_RETRY_MAX) || 5,
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
  const maxRetries = parseInt(process.env.DB_INIT_RETRIES) || 5;
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
    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
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

// Export sequelize instance and helper functions
module.exports = sequelize;
module.exports.testConnection = testConnection;
module.exports.initializeDatabase = initializeDatabase;
module.exports.withTransaction = withTransaction;
