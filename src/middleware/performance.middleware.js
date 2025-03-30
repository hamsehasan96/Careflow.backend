const { redis } = require('../config/redis');
const logger = require('../config/logger');

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const start = process.hrtime();

  // Store original end function
  const originalEnd = res.end;

  // Override end function to capture response time
  res.end = function (chunk, encoding, callback) {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;

    // Log performance metrics
    logger.info('Request Performance:', {
      method: req.method,
      path: req.path,
      duration: `${duration.toFixed(2)}ms`,
      statusCode: res.statusCode,
      ip: req.ip,
      user: req.user ? req.user.id : 'anonymous'
    });

    // Store metrics in Redis for aggregation
    storeMetrics(req.method, req.path, duration, res.statusCode);

    // Call original end function
    return originalEnd.call(this, chunk, encoding, callback);
  };

  next();
};

// Store performance metrics in Redis
async function storeMetrics(method, path, duration, statusCode) {
  try {
    const key = `performance:${method}:${path}`;
    const timestamp = Math.floor(Date.now() / 1000);

    // Store request count
    await redis.hincrby(key, 'count', 1);

    // Store average duration
    const currentAvg = await redis.hget(key, 'avgDuration');
    const currentCount = await redis.hget(key, 'count');
    const newAvg = ((currentAvg || 0) * (currentCount - 1) + duration) / currentCount;
    await redis.hset(key, 'avgDuration', newAvg);

    // Store status code distribution
    await redis.hincrby(key, `status:${statusCode}`, 1);

    // Store timestamp for time-series data
    await redis.zadd(`${key}:timestamps`, timestamp, `${timestamp}:${duration}`);

    // Clean up old data (keep last 24 hours)
    const cutoff = timestamp - (24 * 60 * 60);
    await redis.zremrangebyscore(`${key}:timestamps`, 0, cutoff);

  } catch (error) {
    logger.error('Failed to store performance metrics:', error);
  }
}

// Get performance metrics
async function getPerformanceMetrics(method, path) {
  try {
    const key = `performance:${method}:${path}`;
    const metrics = await redis.hgetall(key);
    
    // Get time-series data
    const timestamps = await redis.zrange(`${key}:timestamps`, 0, -1);
    
    return {
      ...metrics,
      timeSeries: timestamps.map(t => {
        const [ts, duration] = t.split(':');
        return {
          timestamp: parseInt(ts),
          duration: parseFloat(duration)
        };
      })
    };
  } catch (error) {
    logger.error('Failed to get performance metrics:', error);
    return null;
  }
}

// Health check middleware
const healthCheck = (req, res) => {
  const health = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    services: {
      redis: redis.status === 'ready',
      database: global.sequelize ? global.sequelize.authenticate() : false
    }
  };

  try {
    res.status(200).json(health);
  } catch (error) {
    health.message = error;
    res.status(503).json(health);
  }
};

module.exports = {
  performanceMonitor,
  getPerformanceMetrics,
  healthCheck
}; 