const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

describe('Participant API', () => {
  let authToken;
  
  // Setup and teardown
  beforeAll(async () => {
    // Connect to test database
    await sequelize.authenticate();
    
    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@careflow.com',
        password: 'password123'
      });
    
    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    // Close database connection
    await sequelize.close();
  });

  describe('GET /api/participants', () => {
    test('should return list of participants when authenticated', async () => {
      const response = await request(app)
        .get('/api/participants')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should allow filtering participants by name', async () => {
      const response = await request(app)
        .get('/api/participants?name=John')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // All returned participants should have "John" in their name
      response.body.forEach(participant => {
        expect(participant.name.toLowerCase()).toContain('john');
      });
    });

    test('should allow filtering participants by service type', async () => {
      const response = await request(app)
        .get('/api/participants?serviceType=NDIS')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // All returned participants should have NDIS service type
      response.body.forEach(participant => {
        expect(participant.serviceType).toBe('NDIS');
      });
    });

    test('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/participants');

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/participants/:id', () => {
    let participantId;
    
    beforeAll(async () => {
      // Get a participant ID to use in tests
      const response = await request(app)
        .get('/api/participants')
        .set('Authorization', `Bearer ${authToken}`);
      
      participantId = response.body[0]?.id;
    });
    
    test('should return participant details when authenticated', async () => {
      const response = await request(app)
        .get(`/api/participants/${participantId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id', participantId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('serviceType');
    });

    test('should return 404 for non-existent participant', async () => {
      const response = await request(app)
        .get('/api/participants/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(404);
    });

    test('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get(`/api/participants/${participantId}`);

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/participants', () => {
    test('should create a new participant with valid data', async () => {
      const uniqueName = `Test Participant ${Date.now()}`;
      
      const response = await request(app)
        .post('/api/participants')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: uniqueName,
          dateOfBirth: '1990-01-01',
          gender: 'Male',
          contactNumber: '0412345678',
          email: `test-${Date.now()}@example.com`,
          address: '123 Test Street, Perth WA 6000',
          serviceType: 'NDIS',
          ndisNumber: '123456789',
          culturalBackground: 'Australian',
          preferredLanguage: 'English',
          emergencyContactName: 'Emergency Contact',
          emergencyContactNumber: '0498765432'
        });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', uniqueName);
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/participants')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing required fields
          gender: 'Male',
          serviceType: 'NDIS'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    test('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/participants')
        .send({
          name: 'Test Participant',
          dateOfBirth: '1990-01-01',
          gender: 'Male',
          serviceType: 'NDIS'
        });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('PUT /api/participants/:id', () => {
    let testParticipantId;
    
    beforeAll(async () => {
      // Create a test participant to update
      const createResponse = await request(app)
        .post('/api/participants')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `Update Test Participant ${Date.now()}`,
          dateOfBirth: '1990-01-01',
          gender: 'Male',
          contactNumber: '0412345678',
          email: `update-test-${Date.now()}@example.com`,
          address: '123 Test Street, Perth WA 6000',
          serviceType: 'NDIS',
          ndisNumber: '123456789',
          culturalBackground: 'Australian',
          preferredLanguage: 'English',
          emergencyContactName: 'Emergency Contact',
          emergencyContactNumber: '0498765432'
        });
      
      testParticipantId = createResponse.body.id;
    });
    
    test('should update participant with valid data', async () => {
      const updatedName = `Updated Participant ${Date.now()}`;
      
      const response = await request(app)
        .put(`/api/participants/${testParticipantId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: updatedName,
          preferredLanguage: 'Arabic'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('id', testParticipantId);
      expect(response.body).toHaveProperty('name', updatedName);
      expect(response.body).toHaveProperty('preferredLanguage', 'Arabic');
    });

    test('should return 404 for non-existent participant', async () => {
      const response = await request(app)
        .put('/api/participants/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name'
        });

      expect(response.statusCode).toBe(404);
    });

    test('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .put(`/api/participants/${testParticipantId}`)
        .send({
          name: 'Updated Name'
        });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('DELETE /api/participants/:id', () => {
    let testParticipantId;
    
    beforeAll(async () => {
      // Create a test participant to delete
      const createResponse = await request(app)
        .post('/api/participants')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `Delete Test Participant ${Date.now()}`,
          dateOfBirth: '1990-01-01',
          gender: 'Male',
          contactNumber: '0412345678',
          email: `delete-test-${Date.now()}@example.com`,
          address: '123 Test Street, Perth WA 6000',
          serviceType: 'NDIS',
          ndisNumber: '123456789',
          culturalBackground: 'Australian',
          preferredLanguage: 'English',
          emergencyContactName: 'Emergency Contact',
          emergencyContactNumber: '0498765432'
        });
      
      testParticipantId = createResponse.body.id;
    });
    
    test('should delete participant when authenticated', async () => {
      const response = await request(app)
        .delete(`/api/participants/${testParticipantId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message');
      
      // Verify participant is deleted
      const getResponse = await request(app)
        .get(`/api/participants/${testParticipantId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(getResponse.statusCode).toBe(404);
    });

    test('should return 404 for non-existent participant', async () => {
      const response = await request(app)
        .delete('/api/participants/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(404);
    });

    test('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .delete(`/api/participants/${testParticipantId}`);

      expect(response.statusCode).toBe(401);
    });
  });
});
