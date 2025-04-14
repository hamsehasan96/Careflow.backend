const request = require('supertest');
const path = require('path');
const app = require(path.join(__dirname, '..', 'src', 'app'));
const sequelize = require(path.join(__dirname, '..', 'src', 'config', 'database'));
const modelsPath = path.join(__dirname, '..', 'src', 'models');
const Report = require(path.join(modelsPath, 'report.model'));
const User = require(path.join(modelsPath, 'user.model'));
const Participant = require(path.join(modelsPath, 'participant.model'));
const jwt = require('jsonwebtoken');

describe('Report Routes', () => {
  let adminToken;
  let managerToken;
  let staffToken;
  let adminUser;
  let managerUser;
  let staffUser;
  let testParticipant;
  let testReport;

  beforeAll(async () => {
    // Connect to test database
    await sequelize.authenticate();
    await sequelize.sync({ force: true });

    // Create test users
    adminUser = await User.create({
      email: 'admin@test.com',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });

    managerUser = await User.create({
      email: 'manager@test.com',
      password: 'password123',
      firstName: 'Manager',
      lastName: 'User',
      role: 'manager'
    });

    staffUser = await User.create({
      email: 'staff@test.com',
      password: 'password123',
      firstName: 'Staff',
      lastName: 'User',
      role: 'staff'
    });

    // Create test participant
    testParticipant = await Participant.create({
      firstName: 'Test',
      lastName: 'Participant',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'male'
    });

    // Generate tokens
    adminToken = jwt.sign({ id: adminUser.id, role: adminUser.role }, process.env.JWT_SECRET);
    managerToken = jwt.sign({ id: managerUser.id, role: managerUser.role }, process.env.JWT_SECRET);
    staffToken = jwt.sign({ id: staffUser.id, role: staffUser.role }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clear reports table before each test
    await Report.destroy({ where: {}, truncate: true });
  });

  describe('GET /api/reports', () => {
    it('should return all reports for admin', async () => {
      // Create test reports
      await Report.create({
        title: 'Test Report 1',
        content: 'Test content 1',
        participantId: testParticipant.id,
        createdById: adminUser.id,
        status: 'draft'
      });

      await Report.create({
        title: 'Test Report 2',
        content: 'Test content 2',
        participantId: testParticipant.id,
        createdById: managerUser.id,
        status: 'submitted'
      });

      const response = await request(app)
        .get('/api/reports')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('title', 'Test Report 2');
      expect(response.body[1]).toHaveProperty('title', 'Test Report 1');
    });

    it('should return all reports for manager', async () => {
      const response = await request(app)
        .get('/api/reports')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should deny access for staff', async () => {
      const response = await request(app)
        .get('/api/reports')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(403);
    });
  });

  describe('GET /api/reports/:id', () => {
    beforeEach(async () => {
      testReport = await Report.create({
        title: 'Test Report',
        content: 'Test content',
        participantId: testParticipant.id,
        createdById: adminUser.id,
        status: 'draft'
      });
    });

    it('should return a single report for admin', async () => {
      const response = await request(app)
        .get(`/api/reports/${testReport.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('title', 'Test Report');
      expect(response.body).toHaveProperty('content', 'Test content');
    });

    it('should return 404 for non-existent report', async () => {
      const response = await request(app)
        .get('/api/reports/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Report not found');
    });
  });

  describe('POST /api/reports', () => {
    it('should create a new report', async () => {
      const reportData = {
        title: 'New Report',
        content: 'New content',
        participantId: testParticipant.id
      };

      const response = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(reportData)
        .expect(201);

      expect(response.body).toHaveProperty('title', reportData.title);
      expect(response.body).toHaveProperty('content', reportData.content);
      expect(response.body).toHaveProperty('status', 'draft');
      expect(response.body).toHaveProperty('createdById', adminUser.id);
    });
  });

  describe('PUT /api/reports/:id', () => {
    beforeEach(async () => {
      testReport = await Report.create({
        title: 'Test Report',
        content: 'Test content',
        participantId: testParticipant.id,
        createdById: adminUser.id,
        status: 'draft'
      });
    });

    it('should update a report', async () => {
      const updateData = {
        title: 'Updated Report',
        content: 'Updated content'
      };

      const response = await request(app)
        .put(`/api/reports/${testReport.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('title', updateData.title);
      expect(response.body).toHaveProperty('content', updateData.content);
    });
  });

  describe('DELETE /api/reports/:id', () => {
    beforeEach(async () => {
      testReport = await Report.create({
        title: 'Test Report',
        content: 'Test content',
        participantId: testParticipant.id,
        createdById: adminUser.id,
        status: 'draft'
      });
    });

    it('should delete a report (admin only)', async () => {
      await request(app)
        .delete(`/api/reports/${testReport.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify report is deleted
      const deletedReport = await Report.findByPk(testReport.id);
      expect(deletedReport).toBeNull();
    });

    it('should deny delete access to manager', async () => {
      await request(app)
        .delete(`/api/reports/${testReport.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(403);
    });
  });

  describe('Report Status Transitions', () => {
    beforeEach(async () => {
      testReport = await Report.create({
        title: 'Test Report',
        content: 'Test content',
        participantId: testParticipant.id,
        createdById: adminUser.id,
        status: 'draft'
      });
    });

    it('should submit a report', async () => {
      const response = await request(app)
        .post(`/api/reports/${testReport.id}/submit`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'submitted');
    });

    it('should approve a report (admin only)', async () => {
      // First submit the report
      await testReport.update({ status: 'submitted' });

      const response = await request(app)
        .post(`/api/reports/${testReport.id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'approved');
    });

    it('should reject a report (admin only)', async () => {
      // First submit the report
      await testReport.update({ status: 'submitted' });

      const response = await request(app)
        .post(`/api/reports/${testReport.id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'rejected');
    });
  });
}); 