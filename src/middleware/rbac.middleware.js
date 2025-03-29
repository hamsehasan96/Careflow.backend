const jwt = require('jsonwebtoken');
const { User, Role, Permission } = require('../models');
const logger = require('../config/logger');

/**
 * Middleware to authenticate user based on JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user with permissions and role
    const user = await User.findByPk(decoded.id, {
      include: [
        {
          model: Role,
          include: [Permission]
        }
      ]
    });
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Add user to request object
    req.user = user;
    
    // Add user's permissions to request for easy access
    req.userPermissions = user.Role?.Permissions?.map(p => ({
      resource: p.resource,
      action: p.action,
      conditions: p.conditions
    })) || [];
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    logger.error('Authentication error:', error);
    return res.status(500).json({ message: 'Authentication error' });
  }
};

/**
 * Middleware to check if user has required permission
 * @param {string} resource - Resource to check permission for
 * @param {string} action - Action to check permission for
 * @param {Function} conditionFn - Optional function to check additional conditions
 */
const hasPermission = (resource, action, conditionFn) => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Check if user has admin role (admins have all permissions)
      if (req.user.Role?.name === 'admin') {
        return next();
      }
      
      // Check if user has the required permission
      const hasRequiredPermission = req.userPermissions.some(p => 
        p.resource === resource && 
        (p.action === action || p.action === '*')
      );
      
      if (!hasRequiredPermission) {
        return res.status(403).json({ 
          message: `You don't have permission to ${action} ${resource}`
        });
      }
      
      // Check additional conditions if provided
      if (conditionFn && !await conditionFn(req)) {
        return res.status(403).json({ 
          message: 'You do not meet the conditions for this operation'
        });
      }
      
      next();
    } catch (error) {
      logger.error('Permission check error:', error);
      return res.status(500).json({ message: 'Permission check error' });
    }
  };
};

/**
 * Middleware to check if user has required role
 * @param {string|string[]} roles - Role(s) to check
 */
const hasRole = (roles) => {
  const roleArray = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Check if user has one of the required roles
      if (!req.user.Role || !roleArray.includes(req.user.Role.name)) {
        return res.status(403).json({ 
          message: `This action requires one of these roles: ${roleArray.join(', ')}`
        });
      }
      
      next();
    } catch (error) {
      logger.error('Role check error:', error);
      return res.status(500).json({ message: 'Role check error' });
    }
  };
};

/**
 * Middleware to check if user has sufficient role level
 * @param {number} minLevel - Minimum role level required
 */
const hasRoleLevel = (minLevel) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Check if user's role level is sufficient
      if (!req.user.Role || req.user.Role.level < minLevel) {
        return res.status(403).json({ 
          message: `This action requires a role level of at least ${minLevel}`
        });
      }
      
      next();
    } catch (error) {
      logger.error('Role level check error:', error);
      return res.status(500).json({ message: 'Role level check error' });
    }
  };
};

/**
 * Middleware to check if user owns the resource or has admin privileges
 * @param {Function} getResourceOwnerId - Function to get resource owner ID from request
 */
const isResourceOwnerOrAdmin = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Admin can access any resource
      if (req.user.Role?.name === 'admin') {
        return next();
      }
      
      // Get resource owner ID
      const ownerId = await getResourceOwnerId(req);
      
      // Check if user is the resource owner
      if (req.user.id !== ownerId) {
        return res.status(403).json({ 
          message: 'You do not have permission to access this resource'
        });
      }
      
      next();
    } catch (error) {
      logger.error('Resource ownership check error:', error);
      return res.status(500).json({ message: 'Resource ownership check error' });
    }
  };
};

module.exports = {
  authenticate,
  hasPermission,
  hasRole,
  hasRoleLevel,
  isResourceOwnerOrAdmin
};
