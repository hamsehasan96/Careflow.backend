const express = require('express');
const router = express.Router();
const { authenticate, hasPermission } = require('../middleware/rbac.middleware');
const { validate, handleValidationErrors } = require('../middleware/validation.middleware');
const { sanitizeBody } = require('../middleware/sanitization.middleware');
const { AuditLog, User } = require('../models');
const logger = require('../config/logger');
const { Parser } = require('json2csv');

// Get audit logs with filtering and pagination
router.get(
  '/',
  authenticate,
  hasPermission('auditLog', 'read'),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 50,
        userId,
        action,
        resourceType,
        resourceId,
        startDate,
        endDate,
        status
      } = req.query;
      
      // Build filter conditions
      const where = {};
      
      if (userId) where.userId = userId;
      if (action) where.action = action;
      if (resourceType) where.resourceType = resourceType;
      if (resourceId) where.resourceId = resourceId;
      if (status) where.status = status;
      
      // Date range filtering
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.$gte = new Date(startDate);
        if (endDate) where.createdAt.$lte = new Date(endDate);
      }
      
      // Calculate pagination
      const offset = (page - 1) * limit;
      
      // Get audit logs with user information
      const { count, rows: auditLogs } = await AuditLog.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      // Calculate pagination metadata
      const totalPages = Math.ceil(count / limit);
      
      res.status(200).json({
        auditLogs,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      });
    } catch (error) {
      logger.error('Error fetching audit logs:', error);
      res.status(500).json({ message: 'Failed to fetch audit logs' });
    }
  }
);

// Get audit log by ID
router.get(
  '/:id',
  authenticate,
  hasPermission('auditLog', 'read'),
  async (req, res) => {
    try {
      const auditLog = await AuditLog.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ]
      });
      
      if (!auditLog) {
        return res.status(404).json({ message: 'Audit log not found' });
      }
      
      res.status(200).json(auditLog);
    } catch (error) {
      logger.error(`Error fetching audit log ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to fetch audit log' });
    }
  }
);

// Export audit logs as CSV
router.get(
  '/export/csv',
  authenticate,
  hasPermission('auditLog', 'export'),
  async (req, res) => {
    try {
      const {
        userId,
        action,
        resourceType,
        resourceId,
        startDate,
        endDate,
        status
      } = req.query;
      
      // Build filter conditions
      const where = {};
      
      if (userId) where.userId = userId;
      if (action) where.action = action;
      if (resourceType) where.resourceType = resourceType;
      if (resourceId) where.resourceId = resourceId;
      if (status) where.status = status;
      
      // Date range filtering
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.$gte = new Date(startDate);
        if (endDate) where.createdAt.$lte = new Date(endDate);
      }
      
      // Get audit logs with user information
      const auditLogs = await AuditLog.findAll({
        where,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      // Transform data for CSV export
      const csvData = auditLogs.map(log => {
        const plainLog = log.get({ plain: true });
        return {
          id: plainLog.id,
          timestamp: plainLog.createdAt,
          userId: plainLog.userId,
          userName: plainLog.user ? plainLog.user.name : 'System',
          userEmail: plainLog.user ? plainLog.user.email : 'N/A',
          action: plainLog.action,
          resourceType: plainLog.resourceType || 'N/A',
          resourceId: plainLog.resourceId || 'N/A',
          description: plainLog.description,
          ipAddress: plainLog.ipAddress || 'N/A',
          status: plainLog.status
        };
      });
      
      // Generate CSV
      const fields = [
        'id', 'timestamp', 'userId', 'userName', 'userEmail', 'action',
        'resourceType', 'resourceId', 'description', 'ipAddress', 'status'
      ];
      
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(csvData);
      
      // Set headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=audit_logs.csv');
      
      res.status(200).send(csv);
    } catch (error) {
      logger.error('Error exporting audit logs:', error);
      res.status(500).json({ message: 'Failed to export audit logs' });
    }
  }
);

// Create audit log entry (internal use only)
router.post(
  '/',
  authenticate,
  sanitizeBody,
  validate.createAuditLog,
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        userId,
        action,
        resourceType,
        resourceId,
        description,
        ipAddress,
        userAgent,
        metadata,
        status
      } = req.body;
      
      const auditLog = await AuditLog.create({
        userId,
        action,
        resourceType,
        resourceId,
        description,
        ipAddress,
        userAgent,
        metadata,
        status: status || 'success'
      });
      
      res.status(201).json(auditLog);
    } catch (error) {
      logger.error('Error creating audit log:', error);
      res.status(500).json({ message: 'Failed to create audit log' });
    }
  }
);

module.exports = router;
