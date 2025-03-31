const express = require('express');
const router = express.Router();
const path = require('path');
const modelsPath = path.join(__dirname, '..', 'models');
const { verifyToken } = require(path.join(__dirname, '..', 'middleware', 'auth.middleware'));
const { sanitizeUserInput } = require(path.join(__dirname, '..', 'middleware', 'sanitization.middleware'));
const logger = require(path.join(__dirname, '..', 'config', 'logger'));
const AuditLog = require(path.join(modelsPath, 'auditLog.model'));

/**
 * @route GET /api/security/check-https
 * @desc Check if connection is secure (HTTPS)
 * @access Public
 */
router.get('/check-https', (req, res) => {
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  
  return res.status(200).json({
    status: 'success',
    data: {
      secure: isSecure,
      protocol: isSecure ? 'https' : 'http'
    }
  });
});

/**
 * @route GET /api/security/password-policy
 * @desc Get password policy requirements
 * @access Public
 */
router.get('/password-policy', (req, res) => {
  return res.status(200).json({
    status: 'success',
    data: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      maxAge: 90, // days
      preventReuse: 5 // can't reuse last 5 passwords
    }
  });
});

/**
 * @route POST /api/security/check-password-strength
 * @desc Check password strength without storing it
 * @access Public
 */
router.post('/check-password-strength', sanitizeUserInput, (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({
      status: 'error',
      message: 'Password is required'
    });
  }
  
  // Calculate password strength
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const length = password.length;
  
  // Calculate score (0-100)
  let score = 0;
  
  // Length contributes up to 40 points
  score += Math.min(40, length * 4);
  
  // Character variety contributes up to 60 points
  if (hasUppercase) score += 15;
  if (hasLowercase) score += 15;
  if (hasNumbers) score += 15;
  if (hasSpecialChars) score += 15;
  
  // Determine strength category
  let strength = 'weak';
  if (score >= 80) strength = 'strong';
  else if (score >= 60) strength = 'medium';
  
  // Determine if password meets policy requirements
  const meetsPolicy = 
    length >= 8 && 
    hasUppercase && 
    hasLowercase && 
    hasNumbers && 
    hasSpecialChars;
  
  return res.status(200).json({
    status: 'success',
    data: {
      score,
      strength,
      meetsPolicy,
      improvements: [
        !hasUppercase && 'Add uppercase letters',
        !hasLowercase && 'Add lowercase letters',
        !hasNumbers && 'Add numbers',
        !hasSpecialChars && 'Add special characters',
        length < 8 && 'Increase length to at least 8 characters'
      ].filter(Boolean)
    }
  });
});

/**
 * @route GET /api/security/session-info
 * @desc Get current session information
 * @access Private
 */
router.get('/session-info', verifyToken, async (req, res) => {
  try {
    return res.status(200).json({
      status: 'success',
      data: {
        userId: req.userId,
        userRole: req.userRole,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        lastActivity: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error retrieving session info:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve session information'
    });
  }
});

/**
 * @route POST /api/security/report-vulnerability
 * @desc Allow users to report security vulnerabilities
 * @access Private
 */
router.post('/report-vulnerability', verifyToken, sanitizeUserInput, async (req, res) => {
  try {
    const { description, pageUrl, steps } = req.body;
    
    if (!description) {
      return res.status(400).json({
        status: 'error',
        message: 'Description is required'
      });
    }
    
    // Log the vulnerability report
    await AuditLog.createLog({
      userId: req.userId,
      action: 'report',
      resourceType: 'securityVulnerability',
      description: 'User reported security vulnerability',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { description, pageUrl, steps }
    });
    
    // In a real implementation, this would also send an alert to security team
    
    return res.status(200).json({
      status: 'success',
      message: 'Vulnerability report submitted successfully. Thank you for helping improve our security.'
    });
  } catch (error) {
    logger.error('Error submitting vulnerability report:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to submit vulnerability report'
    });
  }
});

module.exports = router;
