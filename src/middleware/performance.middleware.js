const logger = require('../config/logger');

const performanceMiddleware = (req, res, next) => {
  const start = process.hrtime();
  
  // Add response listener
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;
    
    // Log performance metrics
    logger.info('Performance metrics', {
      method: req.method,
      path: req.path,
      duration: `${duration.toFixed(2)}ms`,
      statusCode: res.statusCode,
      userAgent: req.get('user-agent'),
      ip: req.ip
    });
  });
  
  next();
};

module.exports = performanceMiddleware; 