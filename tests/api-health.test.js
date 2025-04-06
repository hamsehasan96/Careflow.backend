const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/config/database');

// Mock data
const testUser = {
  email: 'test@example.com',
  password: 'Password123!'
};

describe('API Health Checks', () => {
  // Close database connection after all tests
  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /', () => {
    it('should return welcome message', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Welcome to Careflow API');
      expect(response.body).toHaveProperty('status', 'success');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('database');
    });
  });

  describe('GET /api/messages', () => {
    it('should handle messages endpoint', async () => {
      const response = await request(app).get('/api/messages');
      
      // Even if it returns 401 Unauthorized, it means the route exists
      // We're just checking the endpoint is properly registered
      expect(response.status).not.toBe(404);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should handle login attempts with dummy credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send(testUser);
      
      // Even if authentication fails, we just want to ensure the endpoint works
      // Not returning 404 means the route is properly registered
      expect(response.status).not.toBe(404);
    });
  });
}); 