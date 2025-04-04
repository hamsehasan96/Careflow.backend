const path = require('path');
const fs = require('fs');
const { Sequelize } = require('sequelize');
const logger = require(path.join(__dirname, '..', 'config', 'logger'));
const sequelize = require(path.join(__dirname, '..', 'config', 'database'));

// Create migrations directory
const migrationsDir = path.join(__dirname, '../../migrations');
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

// Sequelize CLI configuration
const sequelizeCliConfig = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    migrationStorageTableName: 'sequelize_migrations',
    seederStorageTableName: 'sequelize_seeds'
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_TEST || `${process.env.DB_NAME}_test`,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    migrationStorageTableName: 'sequelize_migrations',
    seederStorageTableName: 'sequelize_seeds'
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    migrationStorageTableName: 'sequelize_migrations',
    seederStorageTableName: 'sequelize_seeds',
    logging: false
  }
};

// Write sequelize config to file for CLI usage
fs.writeFileSync(
  path.join(__dirname, '../../.sequelizerc'),
  `const path = require('path');

module.exports = {
  'config': path.resolve('src/config', 'sequelize-cli.js'),
  'models-path': path.resolve('src', 'models'),
  'seeders-path': path.resolve('src/seeders'),
  'migrations-path': path.resolve('migrations')
};`
);

// Write sequelize-cli.js config file
fs.writeFileSync(
  path.join(__dirname, '../config/sequelize-cli.js'),
  `module.exports = ${JSON.stringify(sequelizeCliConfig, null, 2)};`
);

/**
 * Create a migration file
 * @param {string} name - Migration name
 * @returns {string} Path to created migration file
 */
const createMigration = (name) => {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const filename = `${timestamp}-${name}.js`;
  const filePath = path.join(migrationsDir, filename);
  
  const template = `'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', {
     *   id: {
     *     allowNull: false,
     *     autoIncrement: true,
     *     primaryKey: true,
     *     type: Sequelize.INTEGER
     *   },
     *   name: {
     *     type: Sequelize.STRING
     *   },
     *   createdAt: {
     *     allowNull: false,
     *     type: Sequelize.DATE
     *   },
     *   updatedAt: {
     *     allowNull: false,
     *     type: Sequelize.DATE
     *   }
     * });
     */
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
`;

  fs.writeFileSync(filePath, template);
  logger.info(`Created migration: ${filename}`);
  return filePath;
};

/**
 * Run migrations
 * @returns {Promise<void>}
 */
const runMigrations = async () => {
  try {
    const { Umzug, SequelizeStorage } = require('umzug');
    
    const umzug = new Umzug({
      migrations: {
        glob: 'migrations/*.js',
        resolve: ({ name, path, context }) => {
          const migration = require(path);
          return {
            name,
            up: async () => migration.up(context.queryInterface, context.Sequelize),
            down: async () => migration.down(context.queryInterface, context.Sequelize),
          };
        },
      },
      context: { queryInterface: sequelize.getQueryInterface(), Sequelize },
      storage: new SequelizeStorage({ sequelize }),
      logger: console,
    });

    await umzug.up();
    logger.info('Migrations completed successfully');
    return true;
  } catch (error) {
    logger.error('Migration error:', error);
    return false;
  }
};

module.exports = {
  createMigration,
  runMigrations
};
