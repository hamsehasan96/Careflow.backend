const path = require('path');
const { sequelize } = require(path.join(__dirname, '..', 'config', 'database'));
const logger = require(path.join(__dirname, '..', 'config', 'logger'));

// In-memory fallback for metrics when Redis is unavailable
const memoryMetrics = new Map();

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;
    
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration.toFixed(2)}ms`,
      userAgent: req.get('user-agent'),
      ip: req.ip
    });
  });
  
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

// Health check endpoint
const healthCheck = async (req, res) => {
  try {
    // Check database connection
    await sequelize.authenticate();
    
    // Check Redis connection if configured
    let redisStatus = 'not configured';
    if (process.env.REDIS_URL) {
      const Redis = require('ioredis');
      const redis = new Redis(process.env.REDIS_URL);
      await redis.ping();
      redisStatus = 'connected';
      await redis.quit();
    }
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: redisStatus
      },
      environment: process.env.NODE_ENV,
      version: process.env.API_VERSION || '1.0.0'
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      services: {
        database: error.name === 'SequelizeConnectionError' ? 'disconnected' : 'connected',
        redis: 'error'
      }
    });
  }
};

module.exports = {
  performanceMonitor,
  getPerformanceMetrics,
  healthCheck
}; 