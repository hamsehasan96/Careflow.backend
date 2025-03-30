const fs = require('fs');
const path = require('path');
const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');
const logger = require('../config/logger');

const models = {};

// Read all model files
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== 'index.js' &&
      file.slice(-3) === '.js'
    );
  })
  .forEach(file => {
    try {
      const model = require(path.join(__dirname, file));
      if (model && model.name) {
        models[model.name] = model;
        logger.info(`Loaded model: ${model.name}`);
      } else {
        logger.error(`Invalid model in ${file}: Model must have a name property`);
      }
    } catch (error) {
      logger.error(`Error loading model ${file}:`, error);
    }
  });

// Set up associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Export models and sequelize instance
module.exports = {
  sequelize,
  DataTypes,
  ...models
};
