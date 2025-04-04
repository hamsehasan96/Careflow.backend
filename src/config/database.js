const { Sequelize } = require('sequelize');

// Construct database URL based on environment
const getDatabaseUrl = () => {
  if (process.env.DATABASE_URL) {
    // Ensure the URL is properly formatted
    return process.env.DATABASE_URL.replace(/^postgres:/, 'postgresql:');
  }
  
  // Fallback to individual environment variables
  const {
    DB_USER = 'postgres',
    DB_PASSWORD = 'postgres',
    DB_HOST = 'localhost',
    DB_PORT = '5432',
    DB_NAME = 'careflow'
  } = process.env;
  
  return `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
};

const databaseUrl = getDatabaseUrl();
console.log('Using database URL:', databaseUrl.replace(/\/\/[^@]+@/, '//****:****@')); // Log URL with credentials hidden

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
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
    } : false,
    statement_timeout: 30000,
    idle_in_transaction_session_timeout: 30000
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

// Test connection on startup
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
    process.exit(1);
  });

module.exports = sequelize;
