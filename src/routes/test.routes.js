const express = require('express');
const router = express.Router();

/**
 * @route   GET /api/test/connection-test
 * @desc    Test endpoint to verify API connection
 * @access  Public
 */
router.get('/connection-test', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API connection test successful',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    allowedOrigins: process.env.CORS_ORIGIN || '*'
  });
});

module.exports = router; 