const { validationResult } = require('express-validator');
const AuditLog = require('../models/auditLog.model');
const { Op } = require('sequelize');

// Create audit log entry
exports.createAuditLog = async (req, res) => {
  try {
    const { 
      userId, 
      action, 
      entityType, 
      entityId, 
      details, 
      ipAddress, 
      userAgent, 
      organizationId,
      severity,
      complianceCategory
    } = req.body;
    
    const auditLog = await AuditLog.create({
      userId,
      action,
      entityType,
      entityId,
      details,
      ipAddress,
      userAgent,
      organizationId,
      severity: severity || 'info',
      complianceCategory
    });
    
    res.status(201).json(auditLog);
  } catch (error) {
    console.error('Error creating audit log:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get audit logs with filtering
exports.getAuditLogs = async (req, res) => {
  try {
    const { 
      userId, 
      action, 
      entityType, 
      entityId, 
      startDate, 
      endDate, 
      organizationId,
      severity,
      complianceCategory,
      page = 1,
      limit = 50
    } = req.query;
    
    // Build query conditions
    const whereConditions = {};
    
    if (userId) whereConditions.userId = userId;
    if (action) whereConditions.action = action;
    if (entityType) whereConditions.entityType = entityType;
    if (entityId) whereConditions.entityId = entityId;
    if (organizationId) whereConditions.organizationId = organizationId;
    if (severity) whereConditions.severity = severity;
    if (complianceCategory) whereConditions.complianceCategory = complianceCategory;
    
    if (startDate && endDate) {
      whereConditions.timestamp = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereConditions.timestamp = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereConditions.timestamp = {
        [Op.lte]: new Date(endDate)
      };
    }
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Get audit logs with pagination
    const { count, rows: auditLogs } = await AuditLog.findAndCountAll({
      where: whereConditions,
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(count / limit);
    
    res.status(200).json({
      auditLogs,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get audit log by ID
exports.getAuditLogById = async (req, res) => {
  try {
    const auditLog = await AuditLog.findByPk(req.params.id);
    
    if (!auditLog) {
      return res.status(404).json({ message: 'Audit log not found' });
    }
    
    res.status(200).json(auditLog);
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get audit logs for a specific entity
exports.getEntityAuditLogs = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    
    const auditLogs = await AuditLog.findAll({
      where: {
        entityType,
        entityId
      },
      order: [['timestamp', 'DESC']]
    });
    
    res.status(200).json(auditLogs);
  } catch (error) {
    console.error('Error fetching entity audit logs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get compliance audit report
exports.getComplianceReport = async (req, res) => {
  try {
    const { 
      organizationId, 
      startDate, 
      endDate, 
      complianceCategory 
    } = req.query;
    
    if (!organizationId) {
      return res.status(400).json({ message: 'Organization ID is required' });
    }
    
    // Build query conditions
    const whereConditions = {
      organizationId
    };
    
    if (complianceCategory) {
      whereConditions.complianceCategory = complianceCategory;
    }
    
    if (startDate && endDate) {
      whereConditions.timestamp = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereConditions.timestamp = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereConditions.timestamp = {
        [Op.lte]: new Date(endDate)
      };
    }
    
    // Get audit logs for compliance report
    const auditLogs = await AuditLog.findAll({
      where: whereConditions,
      order: [['timestamp', 'DESC']]
    });
    
    // Group logs by compliance category
    const groupedLogs = {};
    
    auditLogs.forEach(log => {
      const category = log.complianceCategory || 'uncategorized';
      
      if (!groupedLogs[category]) {
        groupedLogs[category] = [];
      }
      
      groupedLogs[category].push(log);
    });
    
    // Generate summary statistics
    const summary = {
      totalLogs: auditLogs.length,
      categoryCounts: {},
      severityCounts: {
        info: 0,
        warning: 0,
        critical: 0
      },
      timeRange: {
        start: startDate ? new Date(startDate) : null,
        end: endDate ? new Date(endDate) : null
      }
    };
    
    // Count logs by category
    Object.keys(groupedLogs).forEach(category => {
      summary.categoryCounts[category] = groupedLogs[category].length;
    });
    
    // Count logs by severity
    auditLogs.forEach(log => {
      summary.severityCounts[log.severity]++;
    });
    
    res.status(200).json({
      summary,
      groupedLogs
    });
  } catch (error) {
    console.error('Error generating compliance report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get WA-specific compliance metrics
exports.getWaComplianceMetrics = async (req, res) => {
  try {
    const { organizationId } = req.params;
    
    if (!organizationId) {
      return res.status(400).json({ message: 'Organization ID is required' });
    }
    
    // Get current date and 90 days ago for quarterly reporting
    const currentDate = new Date();
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    // Get audit logs for the last 90 days
    const auditLogs = await AuditLog.findAll({
      where: {
        organizationId,
        timestamp: {
          [Op.between]: [ninetyDaysAgo, currentDate]
        }
      }
    });
    
    // Calculate WA-specific compliance metrics
    const metrics = {
      restrictivePractices: {
        count: 0,
        reportedWithin24Hours: 0,
        reportingComplianceRate: 0
      },
      incidents: {
        count: 0,
        reportedWithin24Hours: 0,
        reportingComplianceRate: 0
      },
      participantFeedback: {
        count: 0,
        respondedWithin7Days: 0,
        responseComplianceRate: 0
      },
      staffCredentials: {
        total: 0,
        current: 0,
        expired: 0,
        complianceRate: 0
      },
      overallComplianceScore: 0
    };
    
    // Process logs to calculate metrics
    auditLogs.forEach(log => {
      if (log.complianceCategory === 'restrictive_practice') {
        metrics.restrictivePractices.count++;
        // Check if reported within 24 hours (would need additional data in a real implementation)
        if (log.details && log.details.includes('reported_within_24_hours')) {
          metrics.restrictivePractices.reportedWithin24Hours++;
        }
      } else if (log.complianceCategory === 'incident') {
        metrics.incidents.count++;
        // Check if reported within 24 hours
        if (log.details && log.details.includes('reported_within_24_hours')) {
          metrics.incidents.reportedWithin24Hours++;
        }
      } else if (log.complianceCategory === 'participant_feedback') {
        metrics.participantFeedback.count++;
        // Check if responded within 7 days
        if (log.details && log.details.includes('responded_within_7_days')) {
          metrics.participantFeedback.respondedWithin7Days++;
        }
      } else if (log.complianceCategory === 'staff_credential') {
        metrics.staffCredentials.total++;
        // Check if credential is current or expired
        if (log.details && log.details.includes('current')) {
          metrics.staffCredentials.current++;
        } else if (log.details && log.details.includes('expired')) {
          metrics.staffCredentials.expired++;
        }
      }
    });
    
    // Calculate compliance rates
    if (metrics.restrictivePractices.count > 0) {
      metrics.restrictivePractices.reportingComplianceRate = 
        (metrics.restrictivePractices.reportedWithin24Hours / metrics.restrictivePractices.count) * 100;
    }
    
    if (metrics.incidents.count > 0) {
      metrics.incidents.reportingComplianceRate = 
        (metrics.incidents.reportedWithin24Hours / metrics.incidents.count) * 100;
    }
    
    if (metrics.participantFeedback.count > 0) {
      metrics.participantFeedback.responseComplianceRate = 
        (metrics.participantFeedback.respondedWithin7Days / metrics.participantFeedback.count) * 100;
    }
    
    if (metrics.staffCredentials.total > 0) {
      metrics.staffCredentials.complianceRate = 
        (metrics.staffCredentials.current / metrics.staffCredentials.total) * 100;
    }
    
    // Calculate overall compliance score (weighted average)
    const weights = {
      restrictivePractices: 0.3,
      incidents: 0.3,
      participantFeedback: 0.2,
      staffCredentials: 0.2
    };
    
    metrics.overallComplianceScore = 
      (metrics.restrictivePractices.reportingComplianceRate * weights.restrictivePractices) +
      (metrics.incidents.reportingComplianceRate * weights.incidents) +
      (metrics.participantFeedback.responseComplianceRate * weights.participantFeedback) +
      (metrics.staffCredentials.complianceRate * weights.staffCredentials);
    
    res.status(200).json(metrics);
  } catch (error) {
    console.error('Error calculating WA compliance metrics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
