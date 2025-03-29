const request = require('supertest');
const app = require('../src/app');
const sequelize = require('../src/config/database');
const User = require('../src/models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

describe('Auth Controller', () => {
  beforeAll(async () => {
    // Connect to test database
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // Close database connection
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clear users table before each test
    await User.destroy({ where: {}, truncate: true });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'staff'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email', userData.email);
      expect(response.body.data).toHaveProperty('firstName', userData.firstName);
      expect(response.body.data).toHaveProperty('lastName', userData.lastName);
      expect(response.body.data).toHaveProperty('role', userData.role);
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should return validation error for invalid data', async () => {
      const invalidUserData = {
        email: 'invalid-email',
        password: 'short',
        firstName: '',
        lastName: '',
        role: 'invalid-role'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUserData)
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Validation failed');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should not allow duplicate email registration', async () => {
      // Create a user first
      await User.create({
        email: 'duplicate@example.com',
        password: await bcrypt.hash('Password123!', 10),
        firstName: 'Test',
        lastName: 'User',
        role: 'staff'
      });

      // Try to register with the same email
      const userData = {
        email: 'duplicate@example.com',
        password: 'Password123!',
        firstName: 'Another',
        lastName: 'User',
        role: 'staff'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Email already in use');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      await User.create({
        email: 'login@example.com',
        password: await bcrypt.hash('Password123!', 10),
        firstName: 'Login',
        lastName: 'Test',
        role: 'staff'
      });
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'Password123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('token');
      
      // Verify token is valid
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
      expect(decoded).toHaveProperty('id');
      expect(decoded).toHaveProperty('email', loginData.email);
    });

    it('should reject login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Password123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });

    it('should reject login with invalid password', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'WrongPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });
  });
});
