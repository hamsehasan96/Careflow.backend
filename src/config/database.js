const { Sequelize } = require('sequelize');

// Construct database URL based on environment
const getDatabaseUrl = () => {
  if (process.env.DATABASE_URL) {
    // Ensure the URL is properly formatted and includes the port
    const url = process.env.DATABASE_URL.replace(/^postgres:/, 'postgresql:');
    if (!url.includes(':5432')) {
      // Add default port if not specified
      return url.replace(/\/$/, ':5432/');
    }
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
  
  return `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
};

const databaseUrl = getDatabaseUrl();
console.log('Environment:', process.env.NODE_ENV);
console.log('Database URL (credentials hidden):', databaseUrl.replace(/\/\/[^@]+@/, '//****:****@'));

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  // Add this configuration to prevent foreign key constraint errors during sync
  sync: {
    force: false,
    alter: true,
    // Skip validation of foreign keys during sync in production
    hooks: process.env.NODE_ENV === 'production'
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
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

module.exports = { sequelize };
