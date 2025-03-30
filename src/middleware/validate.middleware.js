const { validationResult } = require('express-validator');
const logger = require('../config/logger');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn(`Validation failed for ${req.method} ${req.path}:`, errors.array());
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Sanitize request data
const sanitize = (req, res, next) => {
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim();
      }
    });
  }

  // Sanitize body parameters
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }

  next();
};

// Validate API key for worker services
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    logger.warn('API key missing from request');
    return res.status(401).json({
      error: 'API key is required'
    });
  }

  if (apiKey !== process.env.WORKER_API_KEY) {
    logger.warn('Invalid API key provided');
    return res.status(403).json({
      error: 'Invalid API key'
    });
  }

  next();
};

module.exports = {
  validate,
  sanitize,
  validateApiKey
}; 