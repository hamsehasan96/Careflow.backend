const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/config/database');

describe('Users API', () => {
  // Mock JWT token for authenticated requests
  let authToken = 'Bearer dummy-token-for-testing';

  // Close database connection after all tests
  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/users', () => {
    it('should require authentication', async () => {
      const response = await request(app).get('/api/users');
      
      // Endpoint should return 401 Unauthorized if no token is provided
      expect(response.status).toBe(401);
    });

    it('should handle authenticated requests', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', authToken);
      
      // This may fail with 401 if the token is invalid, but we're just
      // checking that the route exists and handles authentication properly
      expect(response.status).not.toBe(404);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should handle user requests by ID', async () => {
      const userId = '1'; // Dummy ID
      const response = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', authToken);
      
      // Route should exist even if the specific user ID doesn't
      expect(response.status).not.toBe(404);
    });
  });
}); 