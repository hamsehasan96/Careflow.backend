const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const AuditLog = require('../models/auditLog.model');
const logger = require('../config/logger');

/**
 * Middleware to create audit logs for user activity
 * @param {string} action - Type of action being performed
 * @param {string} resourceType - Type of resource being accessed
 * @param {Function} getResourceId - Function to extract resource ID from request
 * @param {Function} getDescription - Function to generate description
 * @param {Function} getMetadata - Function to extract additional metadata
 */
const auditActivity = (action, resourceType, getResourceId = null, getDescription = null, getMetadata = null) => {
  return async (req, res, next) => {
    // Store original end function
    const originalEnd = res.end;
    
    // Override end function to capture response
    res.end = async function(chunk, encoding) {
      // Restore original end function
      res.end = originalEnd;
      
      try {
        // Only log if user is authenticated
        if (req.userId) {
          const resourceId = getResourceId ? getResourceId(req) : null;
          const description = getDescription ? getDescription(req, res) : `${action} ${resourceType}`;
          const metadata = getMetadata ? getMetadata(req, res, chunk) : null;
          
          // Create audit log entry
          await AuditLog.createLog({
            userId: req.userId,
            action,
            resourceType,
            resourceId,
            description,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            metadata
          });
        }
      } catch (error) {
        // Log error but don't block the response
        logger.error('Error creating activity audit log:', error);
      }
      
      // Call original end function
      return originalEnd.call(this, chunk, encoding);
    };
    
    next();
  };
};

/**
 * @route POST /api/user-activity/consent
 * @desc Record user consent actions
 * @access Private
 */
router.post('/consent', verifyToken, async (req, res) => {
  try {
    const { consentType, consentValues } = req.body;
    
    if (!consentType || !consentValues) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields'
      });
    }
    
    // Create audit log for consent
    await AuditLog.createLog({
      userId: req.userId,
      action: 'consent',
      resourceType: 'userPreferences',
      description: `User provided consent for ${consentType}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { consentType, consentValues }
    });
    
    return res.status(200).json({
      status: 'success',
      message: 'Consent recorded successfully'
    });
  } catch (error) {
    logger.error('Error recording consent:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to record consent'
    });
  }
});

/**
 * @route GET /api/user-activity/history
 * @desc Get user's own activity history
 * @access Private
 */
router.get('/history', verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    // Get user's activity logs
    const { count, rows } = await AuditLog.findAndCountAll({
      where: { userId: req.userId },
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
    
    return res.status(200).json({
      status: 'success',
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Error retrieving user activity history:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve activity history'
    });
  }
});

module.exports = {
  router,
  auditActivity
};
