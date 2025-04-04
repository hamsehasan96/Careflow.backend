const { Sequelize } = require('sequelize');

// Construct database URL based on environment
const getDatabaseUrl = () => {
  if (process.env.DATABASE_URL) {
    // Ensure the URL is properly formatted
    const url = process.env.DATABASE_URL.replace(/^postgres:/, 'postgresql:');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Database URL (credentials hidden):', url.replace(/\/\/[^@]+@/, '//****:****@'));
    return url;
  }
  
  // Fallback to individual environment variables
  const {
    DB_USER = 'postgres',
    DB_PASSWORD = 'postgres',
    DB_HOST = 'localhost',
    DB_PORT = '5432',
    DB_NAME = 'careflow'
  } = process.env;
  
  const url = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
  console.log('Using fallback database URL (credentials hidden):', url.replace(/\/\/[^@]+@/, '//****:****@'));
  return url;
};

const databaseUrl = getDatabaseUrl();

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: (msg) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Sequelize:', msg);
    }
  },
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
console.log('Attempting to connect to database...');
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
    return sequelize.query('SELECT version();');
  })
  .then(([results]) => {
    console.log('Database version:', results[0].version);
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    process.exit(1);
  });

module.exports = sequelize;
