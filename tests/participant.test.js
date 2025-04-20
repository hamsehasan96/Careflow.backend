const request = require('supertest');
const path = require('path');
const app = require(path.join(__dirname, '..', 'src', 'app'));
const sequelize = require(path.join(__dirname, '..', 'src', 'config', 'database'));
const modelsPath = path.join(__dirname, '..', 'src', 'models');
const Participant = require(path.join(modelsPath, 'participant.model'));
const User = require(path.join(modelsPath, 'user.model'));
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

describe('Participant API', () => {
  let authToken;
  let adminToken;
  
  beforeAll(async () => {
    // Connect to test database
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    
    // Create test users
    const staffUser = await User.create({
      email: 'staff@example.com',
      password: await bcrypt.hash('Password123!', 10),
      firstName: 'Staff',
      lastName: 'User',
      role: 'staff'
    });
    
    const adminUser = await User.create({
      email: 'admin@example.com',
      password: await bcrypt.hash('Password123!', 10),
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });
    
    // Generate tokens
    authToken = jwt.sign(
      { id: staffUser.id, email: staffUser.email, role: staffUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    adminToken = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: adminUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });
  
  afterAll(async () => {
    // Close database connection
    await sequelize.close();
  });
  
  beforeEach(async () => {
    // Clear participants table before each test
    await Participant.destroy({ where: {}, truncate: true });
  });
  
  describe('GET /api/participants', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/participants')
        .expect(403);
      
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'No token provided');
    });
    
    it('should return empty array when no participants exist', async () => {
      const response = await request(app)
        .get('/api/participants')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(0);
    });
    
    it('should return all participants', async () => {
      // Create test participants
      await Participant.bulkCreate([
        {
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1990-01-01',
          gender: 'male',
          email: 'john@example.com',
          phone: '1234567890',
          address: '123 Main St',
          ndisNumber: 'NDIS123456',
          culturalBackground: 'Australian'
        },
        {
          firstName: 'Jane',
          lastName: 'Smith',
          dateOfBirth: '1992-05-15',
          gender: 'female',
          email: 'jane@example.com',
          phone: '0987654321',
          address: '456 Oak Ave',
          ndisNumber: 'NDIS654321',
          culturalBackground: 'Chinese'
        }
      ]);
      
      const response = await request(app)
        .get('/api/participants')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0]).toHaveProperty('firstName', 'John');
      expect(response.body.data[1]).toHaveProperty('firstName', 'Jane');
    });
  });
  
  describe('POST /api/participants', () => {
    it('should create a new participant', async () => {
      const participantData = {
        firstName: 'New',
        lastName: 'Participant',
        dateOfBirth: '1985-10-20',
        gender: 'female',
        email: 'new@example.com',
        phone: '5551234567',
        address: '789 Pine St',
        ndisNumber: 'NDIS789012',
        culturalBackground: 'Italian'
      };
      
      const response = await request(app)
        .post('/api/participants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(participantData)
        .expect(201);
      
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'Participant created successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('firstName', participantData.firstName);
      expect(response.body.data).toHaveProperty('lastName', participantData.lastName);
      expect(response.body.data).toHaveProperty('ndisNumber', participantData.ndisNumber);
      
      // Verify participant was saved to database
      const savedParticipant = await Participant.findByPk(response.body.data.id);
      expect(savedParticipant).not.toBeNull();
      expect(savedParticipant.email).toBe(participantData.email);
    });
    
    it('should validate required fields', async () => {
      const invalidData = {
        // Missing required fields
        lastName: 'Incomplete',
        email: 'incomplete@example.com'
      };
      
      const response = await request(app)
        .post('/api/participants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
      
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Validation failed');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors.some(err => err.field === 'firstName')).toBe(true);
    });
  });
  
  describe('GET /api/participants/:id', () => {
    let testParticipant;
    
    beforeEach(async () => {
      // Create a test participant
      testParticipant = await Participant.create({
        firstName: 'Test',
        lastName: 'Participant',
        dateOfBirth: '1980-03-15',
        gender: 'male',
        email: 'test.participant@example.com',
        phone: '1112223333',
        address: '101 Test Rd',
        ndisNumber: 'NDIS101010',
        culturalBackground: 'Greek'
      });
    });
    
    it('should return a participant by ID', async () => {
      const response = await request(app)
        .get(`/api/participants/${testParticipant.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('id', testParticipant.id);
      expect(response.body.data).toHaveProperty('firstName', testParticipant.firstName);
      expect(response.body.data).toHaveProperty('lastName', testParticipant.lastName);
      expect(response.body.data).toHaveProperty('ndisNumber', testParticipant.ndisNumber);
    });
    
    it('should return 404 for non-existent participant', async () => {
      const response = await request(app)
        .get('/api/participants/9999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
      
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Participant not found');
    });
  });
});
