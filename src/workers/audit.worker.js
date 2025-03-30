const { audit } = require('../config/queue');
const logger = require('../config/logger');
const { sequelize } = require('../config/database');
const { AuditLog, User, Participant } = require('../models');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Process audit jobs
audit.process(async (job) => {
  const { type, data } = job.data;

  try {
    switch (type) {
      case 'LOG_ACTIVITY':
        await logActivity(data);
        break;
      case 'GENERATE_AUDIT_REPORT':
        await generateAuditReport(data);
        break;
      case 'CHECK_COMPLIANCE':
        await checkCompliance(data);
        break;
      case 'EXPORT_AUDIT_LOGS':
        await exportAuditLogs(data);
        break;
      case 'ARCHIVE_OLD_LOGS':
        await archiveOldLogs();
        break;
      default:
        throw new Error(`Unknown audit job type: ${type}`);
    }

    logger.info(`Audit job ${type} completed successfully`);
    return { success: true };
  } catch (error) {
    logger.error(`Audit job ${type} failed:`, error);
    throw error;
  }
});

// Log activity
async function logActivity(data) {
  const { userId, action, resourceType, resourceId, details, ipAddress } = data;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Create audit log entry
    const auditLog = await AuditLog.create({
      userId,
      action,
      resourceType,
      resourceId,
      details,
      ipAddress,
      timestamp: new Date()
    });

    // Check for suspicious activity
    await checkSuspiciousActivity(auditLog);

    return auditLog;
  } catch (error) {
    logger.error('Failed to log activity:', error);
    throw error;
  }
}

// Generate audit report
async function generateAuditReport(data) {
  const { startDate, endDate, resourceType, userId } = data;

  try {
    // Get audit logs
    const logs = await AuditLog.findAll({
      where: {
        timestamp: {
          [sequelize.Op.between]: [startDate, endDate]
        },
        ...(resourceType && { resourceType }),
        ...(userId && { userId })
      },
      include: [
        { model: User },
        { model: Participant }
      ],
      order: [['timestamp', 'DESC']]
    });

    // Generate PDF report
    const pdfPath = await generateAuditReportPDF(logs, startDate, endDate);

    // Send report notification
    await sendAuditReportNotification(pdfPath);

    return pdfPath;
  } catch (error) {
    logger.error('Failed to generate audit report:', error);
    throw error;
  }
}

// Check compliance
async function checkCompliance(data) {
  const { participantId, period } = data;

  try {
    const participant = await Participant.findByPk(participantId);
    if (!participant) {
      throw new Error('Participant not found');
    }

    // Get all audit logs for the participant
    const logs = await AuditLog.findAll({
      where: {
        resourceType: 'participant',
        resourceId: participantId,
        timestamp: {
          [sequelize.Op.between]: [period.start, period.end]
        }
      },
      include: [{ model: User }]
    });

    // Check for compliance issues
    const complianceIssues = await analyzeCompliance(logs);

    // Generate compliance report
    const report = await generateComplianceReport(participant, logs, complianceIssues);

    // Send compliance notification
    await sendComplianceNotification(participant, report);

    return report;
  } catch (error) {
    logger.error('Failed to check compliance:', error);
    throw error;
  }
}

// Export audit logs
async function exportAuditLogs(data) {
  const { startDate, endDate, format } = data;

  try {
    // Get audit logs
    const logs = await AuditLog.findAll({
      where: {
        timestamp: {
          [sequelize.Op.between]: [startDate, endDate]
        }
      },
      include: [
        { model: User },
        { model: Participant }
      ],
      order: [['timestamp', 'DESC']]
    });

    // Export based on format
    let exportPath;
    switch (format) {
      case 'csv':
        exportPath = await exportToCSV(logs);
        break;
      case 'json':
        exportPath = await exportToJSON(logs);
        break;
      case 'pdf':
        exportPath = await generateAuditReportPDF(logs, startDate, endDate);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    // Send export notification
    await sendExportNotification(exportPath);

    return exportPath;
  } catch (error) {
    logger.error('Failed to export audit logs:', error);
    throw error;
  }
}

// Archive old logs
async function archiveOldLogs() {
  const retentionPeriod = 365; // 1 year
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionPeriod);

  try {
    // Get old logs
    const oldLogs = await AuditLog.findAll({
      where: {
        timestamp: {
          [sequelize.Op.lt]: cutoffDate
        }
      }
    });

    // Archive logs
    for (const log of oldLogs) {
      await archiveLog(log);
    }

    return oldLogs.length;
  } catch (error) {
    logger.error('Failed to archive old logs:', error);
    throw error;
  }
}

// Helper functions
async function checkSuspiciousActivity(auditLog) {
  // Implement suspicious activity detection logic
  // This could include:
  // - Multiple failed login attempts
  // - Unauthorized access attempts
  // - Unusual data modifications
  // - Access from unusual locations
}

async function generateAuditReportPDF(logs, startDate, endDate) {
  const doc = new PDFDocument();
  const fileName = `audit-report-${Date.now()}.pdf`;
  const filePath = path.join(process.env.UPLOAD_DIR, fileName);

  doc.pipe(fs.createWriteStream(filePath));

  // Add report header
  doc.fontSize(20).text('Audit Report', { align: 'center' });
  doc.moveDown();

  // Add date range
  doc.fontSize(12).text(`Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`);
  doc.moveDown();

  // Add summary
  doc.fontSize(14).text('Summary');
  doc.fontSize(12);
  doc.text(`Total Activities: ${logs.length}`);
  doc.text(`Unique Users: ${new Set(logs.map(log => log.userId)).size}`);
  doc.text(`Unique Resources: ${new Set(logs.map(log => `${log.resourceType}-${log.resourceId}`)).size}`);
  doc.moveDown();

  // Add activities
  doc.fontSize(14).text('Activities');
  doc.fontSize(12);
  logs.forEach(log => {
    doc.text(`${new Date(log.timestamp).toLocaleString()} - ${log.User.name} - ${log.action} - ${log.resourceType} (${log.resourceId})`);
    if (log.details) {
      doc.text(`Details: ${log.details}`);
    }
    doc.moveDown();
  });

  doc.end();
  return filePath;
}

async function analyzeCompliance(logs) {
  const issues = [];

  // Check for unauthorized access
  const unauthorizedAccess = logs.filter(log => log.action === 'unauthorized_access');
  if (unauthorizedAccess.length > 0) {
    issues.push({
      type: 'unauthorized_access',
      count: unauthorizedAccess.length,
      details: unauthorizedAccess.map(log => ({
        timestamp: log.timestamp,
        user: log.User.name
      }))
    });
  }

  // Check for data modifications
  const dataModifications = logs.filter(log => log.action === 'modify');
  if (dataModifications.length > 0) {
    issues.push({
      type: 'data_modification',
      count: dataModifications.length,
      details: dataModifications.map(log => ({
        timestamp: log.timestamp,
        user: log.User.name,
        resource: log.resourceType
      }))
    });
  }

  // Add more compliance checks as needed

  return issues;
}

async function generateComplianceReport(participant, logs, issues) {
  const doc = new PDFDocument();
  const fileName = `compliance-report-${participant.id}-${Date.now()}.pdf`;
  const filePath = path.join(process.env.UPLOAD_DIR, fileName);

  doc.pipe(fs.createWriteStream(filePath));

  // Add report header
  doc.fontSize(20).text('Compliance Report', { align: 'center' });
  doc.moveDown();

  // Add participant details
  doc.fontSize(12).text(`Participant: ${participant.name}`);
  doc.text(`NDIS Number: ${participant.ndisNumber}`);
  doc.moveDown();

  // Add issues summary
  doc.fontSize(14).text('Compliance Issues');
  doc.fontSize(12);
  if (issues.length === 0) {
    doc.text('No compliance issues found.');
  } else {
    issues.forEach(issue => {
      doc.text(`${issue.type}: ${issue.count} occurrences`);
      issue.details.forEach(detail => {
        doc.text(`- ${new Date(detail.timestamp).toLocaleString()} by ${detail.user}`);
        if (detail.resource) {
          doc.text(`  Resource: ${detail.resource}`);
        }
      });
      doc.moveDown();
    });
  }

  doc.end();
  return filePath;
}

async function archiveLog(log) {
  // Implement log archiving logic
  // This could include:
  // - Moving to a separate archive table
  // - Compressing and storing in cold storage
  // - Updating retention metadata
}

async function exportToCSV(logs) {
  // Implement CSV export logic
  return '';
}

async function exportToJSON(logs) {
  // Implement JSON export logic
  return '';
}

async function sendAuditReportNotification(pdfPath) {
  // Implement notification logic
}

async function sendComplianceNotification(participant, report) {
  // Implement notification logic
}

async function sendExportNotification(exportPath) {
  // Implement notification logic
}

// Handle failed jobs
audit.on('failed', (job, error) => {
  logger.error(`Audit job ${job.id} failed:`, error);
});

// Handle completed jobs
audit.on('completed', (job) => {
  logger.info(`Audit job ${job.id} completed successfully`);
});

module.exports = audit; 