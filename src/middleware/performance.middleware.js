const { redis } = require('../config/redis');
const logger = require('../config/logger');

// In-memory fallback for metrics when Redis is unavailable
const memoryMetrics = new Map();

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

    // Store metrics in Redis or memory
    storeMetrics(req.method, req.path, duration, res.statusCode).catch(error => {
      logger.error('Failed to store performance metrics:', error);
    });

    // Call original end function
    return originalEnd.call(this, chunk, encoding, callback);
  };

  next();
};

// Store performance metrics in Redis or memory
async function storeMetrics(method, path, duration, statusCode) {
  const key = `performance:${method}:${path}`;
  const timestamp = Math.floor(Date.now() / 1000);

  try {
    // Try Redis first
    await redis.hincrby(key, 'count', 1);
    const currentAvg = await redis.hget(key, 'avgDuration');
    const currentCount = await redis.hget(key, 'count');
    const newAvg = ((currentAvg || 0) * (currentCount - 1) + duration) / currentCount;
    await redis.hset(key, 'avgDuration', newAvg);
    await redis.hincrby(key, `status:${statusCode}`, 1);
    await redis.zadd(`${key}:timestamps`, timestamp, `${timestamp}:${duration}`);

    // Clean up old data (keep last 24 hours)
    const cutoff = timestamp - (24 * 60 * 60);
    await redis.zremrangebyscore(`${key}:timestamps`, 0, cutoff);
  } catch (error) {
    // Fallback to memory storage
    logger.warn('Redis unavailable, using memory storage for metrics');
    const metrics = memoryMetrics.get(key) || {
      count: 0,
      avgDuration: 0,
      statusCodes: {},
      timestamps: []
    };

    metrics.count++;
    metrics.avgDuration = ((metrics.avgDuration * (metrics.count - 1)) + duration) / metrics.count;
    metrics.statusCodes[statusCode] = (metrics.statusCodes[statusCode] || 0) + 1;
    metrics.timestamps.push({ timestamp, duration });

    // Clean up old data
    metrics.timestamps = metrics.timestamps.filter(t => t.timestamp > timestamp - (24 * 60 * 60));

    memoryMetrics.set(key, metrics);
  }
}

// Get performance metrics
async function getPerformanceMetrics(method, path) {
  const key = `performance:${method}:${path}`;

  try {
    // Try Redis first
    const metrics = await redis.hgetall(key);
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
    // Fallback to memory storage
    logger.warn('Redis unavailable, using memory storage for metrics');
    const metrics = memoryMetrics.get(key);
    if (!metrics) return null;

    return {
      count: metrics.count,
      avgDuration: metrics.avgDuration,
      statusCodes: metrics.statusCodes,
      timeSeries: metrics.timestamps
    };
  }
}

// Health check middleware
const healthCheck = async (req, res) => {
  const health = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    services: {
      redis: false,
      database: false
    }
  };

  try {
    // Check Redis connection
    try {
      await redis.ping();
      health.services.redis = true;
    } catch (error) {
      logger.error('Redis health check failed:', error);
      health.services.redis = false;
    }

    // Check database connection
    try {
      await global.sequelize.authenticate();
      health.services.database = true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      health.services.database = false;
    }

    // Set overall health status
    health.status = Object.values(health.services).every(Boolean) ? 'healthy' : 'degraded';
    
    res.status(200).json(health);
  } catch (error) {
    health.message = error.message;
    health.status = 'unhealthy';
    res.status(503).json(health);
  }
};

module.exports = {
  performanceMonitor,
  getPerformanceMetrics,
  healthCheck
}; 