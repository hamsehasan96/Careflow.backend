const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

describe('Authentication API', () => {
  // Setup and teardown
  beforeAll(async () => {
    // Connect to test database
    await sequelize.authenticate();
  });

  afterAll(async () => {
    // Close database connection
    await sequelize.close();
  });

  describe('POST /api/auth/login', () => {
    test('should login a user with valid credentials', async () => {
      // Create a test user first or use a seeded user
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@careflow.com',
          password: 'password123'
        });

      expect(loginResponse.statusCode).toBe(200);
      expect(loginResponse.body).toHaveProperty('token');
      expect(loginResponse.body).toHaveProperty('user');
      expect(loginResponse.body.user).toHaveProperty('email', 'admin@careflow.com');
    });

    test('should return 401 with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@careflow.com',
          password: 'wrongpassword'
        });

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: '',
          password: ''
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user with valid data', async () => {
      const uniqueEmail = `test-${Date.now()}@example.com`;
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: uniqueEmail,
          password: 'Password123!',
          role: 'staff'
        });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', uniqueEmail);
    });

    test('should prevent registration with existing email', async () => {
      // Use the admin email which should already exist
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate User',
          email: 'admin@careflow.com',
          password: 'Password123!',
          role: 'staff'
        });

      expect(response.statusCode).toBe(409);
      expect(response.body).toHaveProperty('message');
    });

    test('should validate password strength', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Weak Password User',
          email: 'weak@example.com',
          password: 'weak',
          role: 'staff'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors.some(e => e.param === 'password')).toBe(true);
    });
  });

  describe('GET /api/auth/me', () => {
    test('should return user profile when authenticated', async () => {
      // Login first to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@careflow.com',
          password: 'password123'
        });

      const token = loginResponse.body.token;

      // Use token to get profile
      const profileResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(profileResponse.statusCode).toBe(200);
      expect(profileResponse.body).toHaveProperty('id');
      expect(profileResponse.body).toHaveProperty('email', 'admin@careflow.com');
    });

    test('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.statusCode).toBe(401);
    });

    test('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.statusCode).toBe(401);
    });
  });
});
