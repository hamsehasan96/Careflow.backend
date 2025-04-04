const express = require('express');
const router = express.Router();
const path = require('path');
const modelsPath = path.join(__dirname, '..', 'models');
const { verifyToken } = require(path.join(__dirname, '..', 'middleware', 'auth.middleware'));
const AuditLog = require(path.join(modelsPath, 'auditLog.model'));
const logger = require(path.join(__dirname, '..', 'config', 'logger'));
const { authenticate } = require(path.join(__dirname, '..', 'middleware', 'auth.middleware'));
const { validateUserActivity } = require(path.join(__dirname, '..', 'middleware', 'validate.middleware'));

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

// Get all user activities
router.get('/', authenticate, async (req, res) => {
  try {
    res.json({ message: 'Get all user activities' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user activity by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    res.json({ message: 'Get user activity by ID' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new user activity
router.post('/', authenticate, validateUserActivity, async (req, res) => {
  try {
    res.status(201).json({ message: 'Create new user activity' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user activity
router.put('/:id', authenticate, validateUserActivity, async (req, res) => {
  try {
    res.json({ message: 'Update user activity' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user activity
router.delete('/:id', authenticate, async (req, res) => {
  try {
    res.json({ message: 'Delete user activity' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = {
  router,
  auditActivity
};
