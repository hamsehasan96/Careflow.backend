const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const logger = require('../config/logger');
const User = require('../models/user.model');

/**
 * Middleware to validate user registration input
 */
const validateRegistration = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('role').isIn(['admin', 'manager', 'staff', 'caregiver', 'family', 'participant'])
    .withMessage('Invalid role specified')
];

/**
 * Middleware to validate user login input
 */
const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required')
];

/**
 * Middleware to verify JWT token
 */
const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'] || req.headers['authorization']?.split(' ')[1];

  if (!token) {
    logger.warn('No token provided for authenticated route');
    return res.status(403).json({
      status: 'error',
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    logger.error(`Token verification failed: ${error.message}`);
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized: Invalid token'
    });
  }
};

/**
 * Middleware to check if user has required role
 * @param {string[]} roles - Array of allowed roles
 */
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      logger.error('User role not found in request');
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error: Role verification failed'
      });
    }

    if (roles.includes(req.userRole)) {
      next();
    } else {
      logger.warn(`Access denied: User role ${req.userRole} not in allowed roles [${roles.join(', ')}]`);
      return res.status(403).json({
        status: 'error',
        message: 'Access denied: Insufficient permissions'
      });
    }
  };
};

/**
 * Middleware to check if user is accessing their own data or has admin privileges
 * @param {Function} getResourceUserId - Function to extract resource owner ID from request
 */
const checkOwnership = (getResourceUserId) => {
  return async (req, res, next) => {
    try {
      // Admin and managers can access all resources
      if (['admin', 'manager'].includes(req.userRole)) {
        return next();
      }

      const resourceUserId = await getResourceUserId(req);
      
      // If resource doesn't belong to any user, deny access
      if (!resourceUserId) {
        logger.warn('Resource ownership check failed: Resource not found');
        return res.status(404).json({
          status: 'error',
          message: 'Resource not found'
        });
      }

      // Allow access if user is accessing their own data
      if (resourceUserId.toString() === req.userId.toString()) {
        return next();
      }

      logger.warn(`Ownership check failed: User ${req.userId} attempted to access resource owned by ${resourceUserId}`);
      return res.status(403).json({
        status: 'error',
        message: 'Access denied: You can only access your own data'
      });
    } catch (error) {
      logger.error(`Ownership check error: ${error.message}`);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error during ownership verification'
      });
    }
  };
};

module.exports = {
  validateRegistration,
  validateLogin,
  verifyToken,
  checkRole,
  checkOwnership
};
