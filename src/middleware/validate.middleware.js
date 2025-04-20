const path = require('path');
const { validationResult } = require('express-validator');
const logger = require(path.join(__dirname, '..', 'config', 'logger'));

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation failed:', {
      errors: errors.array(),
      path: req.path,
      method: req.method,
      ip: req.ip
    });

    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array(),
      code: 'VALIDATION_ERROR'
    });
  }
  next();
};

// Sanitization middleware
const sanitize = (req, res, next) => {
  // Sanitize request body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim();
      }
    });
  }

  next();
};

// API key validation
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    logger.warn('API key missing from request');
    return res.status(401).json({
      status: 'error',
      message: 'API key is required',
      code: 'API_KEY_MISSING'
    });
  }

  if (apiKey !== process.env.API_KEY) {
    logger.warn('Invalid API key used');
    return res.status(403).json({
      status: 'error',
      message: 'Invalid API key',
      code: 'INVALID_API_KEY'
    });
  }

  next();
};

// Common validation rules
const commonValidations = {
  id: {
    in: ['params'],
    isInt: true,
    toInt: true,
    errorMessage: 'Invalid ID format'
  },
  email: {
    in: ['body'],
    isEmail: true,
    normalizeEmail: true,
    errorMessage: 'Invalid email format'
  },
  password: {
    in: ['body'],
    isLength: {
      min: 8,
      max: 50
    },
    matches: {
      options: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
    },
    errorMessage: 'Invalid password format'
  },
  page: {
    in: ['query'],
    optional: true,
    isInt: { min: 1 },
    toInt: true,
    errorMessage: 'Page must be a positive integer'
  },
  limit: {
    in: ['query'],
    optional: true,
    isInt: { min: 1, max: 100 },
    toInt: true,
    errorMessage: 'Limit must be between 1 and 100'
  },
  sort: {
    in: ['query'],
    optional: true,
    isIn: {
      options: [['asc', 'desc']],
      errorMessage: 'Sort must be either asc or desc'
    }
  }
};

module.exports = {
  validate,
  sanitize,
  validateApiKey,
  commonValidations
}; 