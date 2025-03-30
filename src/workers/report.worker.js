const { reports } = require('../config/queue');
const logger = require('../config/logger');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { sequelize } = require('../config/database');
const { Participant, CareNote, Appointment, IncidentReport } = require('../models');

// Process report jobs
reports.process(async (job) => {
  const { type, data, participantId, startDate, endDate } = job.data;

  try {
    switch (type) {
      case 'CARE_ANALYTICS':
        await generateCareAnalytics(participantId, startDate, endDate);
        break;
      case 'COMPLIANCE_REPORT':
        await generateComplianceReport(participantId, startDate, endDate);
        break;
      case 'BUDGET_REPORT':
        await generateBudgetReport(participantId, startDate, endDate);
        break;
      case 'HEALTH_METRICS':
        await generateHealthMetrics(participantId, startDate, endDate);
        break;
      default:
        throw new Error(`Unknown report type: ${type}`);
    }

    logger.info(`Report ${type} generated successfully for participant ${participantId}`);
    return { success: true };
  } catch (error) {
    logger.error(`Report generation failed for ${type}:`, error);
    throw error;
  }
});

// Generate Care Analytics Report
async function generateCareAnalytics(participantId, startDate, endDate) {
  const doc = new PDFDocument();
  const fileName = `care-analytics-${participantId}-${Date.now()}.pdf`;
  const filePath = path.join(process.env.UPLOAD_DIR, fileName);

  doc.pipe(fs.createWriteStream(filePath));

  // Add report header
  doc.fontSize(20).text('Care Analytics Report', { align: 'center' });
  doc.moveDown();

  // Add date range
  doc.fontSize(12).text(`Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`);
  doc.moveDown();

  // Fetch care notes
  const careNotes = await CareNote.findAll({
    where: {
      participantId,
      createdAt: {
        [sequelize.Op.between]: [startDate, endDate]
      }
    }
  });

  // Add care statistics
  doc.fontSize(14).text('Care Statistics');
  doc.fontSize(12);
  doc.text(`Total Care Notes: ${careNotes.length}`);
  doc.text(`Average Care Duration: ${calculateAverageDuration(careNotes)} minutes`);
  doc.text(`Most Common Care Activities: ${getMostCommonActivities(careNotes)}`);
  doc.moveDown();

  // Add appointment statistics
  const appointments = await Appointment.findAll({
    where: {
      participantId,
      date: {
        [sequelize.Op.between]: [startDate, endDate]
      }
    }
  });

  doc.fontSize(14).text('Appointment Statistics');
  doc.fontSize(12);
  doc.text(`Total Appointments: ${appointments.length}`);
  doc.text(`Completed Appointments: ${appointments.filter(a => a.status === 'completed').length}`);
  doc.text(`Cancelled Appointments: ${appointments.filter(a => a.status === 'cancelled').length}`);
  doc.moveDown();

  // Add incident statistics
  const incidents = await IncidentReport.findAll({
    where: {
      participantId,
      incidentDate: {
        [sequelize.Op.between]: [startDate, endDate]
      }
    }
  });

  doc.fontSize(14).text('Incident Statistics');
  doc.fontSize(12);
  doc.text(`Total Incidents: ${incidents.length}`);
  doc.text(`Severity Distribution: ${getSeverityDistribution(incidents)}`);
  doc.text(`Most Common Incident Types: ${getMostCommonIncidents(incidents)}`);

  doc.end();
  return filePath;
}

// Generate Compliance Report
async function generateComplianceReport(participantId, startDate, endDate) {
  const doc = new PDFDocument();
  const fileName = `compliance-report-${participantId}-${Date.now()}.pdf`;
  const filePath = path.join(process.env.UPLOAD_DIR, fileName);

  doc.pipe(fs.createWriteStream(filePath));

  // Add report header
  doc.fontSize(20).text('Compliance Report', { align: 'center' });
  doc.moveDown();

  // Add date range
  doc.fontSize(12).text(`Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`);
  doc.moveDown();

  // Fetch participant data
  const participant = await Participant.findByPk(participantId);
  if (!participant) throw new Error('Participant not found');

  // Add NDIS compliance
  doc.fontSize(14).text('NDIS Compliance');
  doc.fontSize(12);
  doc.text(`NDIS Number: ${participant.ndisNumber}`);
  doc.text(`Plan Type: ${participant.planType}`);
  doc.text(`Plan Budget: $${participant.planBudget}`);
  doc.text(`Plan Status: ${participant.planStatus}`);
  doc.moveDown();

  // Add care compliance
  const careNotes = await CareNote.findAll({
    where: {
      participantId,
      createdAt: {
        [sequelize.Op.between]: [startDate, endDate]
      }
    }
  });

  doc.fontSize(14).text('Care Compliance');
  doc.fontSize(12);
  doc.text(`Required Care Hours: ${participant.requiredCareHours}`);
  doc.text(`Actual Care Hours: ${calculateActualCareHours(careNotes)}`);
  doc.text(`Compliance Rate: ${calculateComplianceRate(participant.requiredCareHours, calculateActualCareHours(careNotes))}%`);
  doc.moveDown();

  // Add documentation compliance
  doc.fontSize(14).text('Documentation Compliance');
  doc.fontSize(12);
  doc.text(`Care Notes: ${careNotes.length}`);
  doc.text(`Incident Reports: ${await getIncidentReportCount(participantId, startDate, endDate)}`);
  doc.text(`Appointment Records: ${await getAppointmentCount(participantId, startDate, endDate)}`);

  doc.end();
  return filePath;
}

// Generate Budget Report
async function generateBudgetReport(participantId, startDate, endDate) {
  const doc = new PDFDocument();
  const fileName = `budget-report-${participantId}-${Date.now()}.pdf`;
  const filePath = path.join(process.env.UPLOAD_DIR, fileName);

  doc.pipe(fs.createWriteStream(filePath));

  // Add report header
  doc.fontSize(20).text('Budget Report', { align: 'center' });
  doc.moveDown();

  // Add date range
  doc.fontSize(12).text(`Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`);
  doc.moveDown();

  // Fetch participant data
  const participant = await Participant.findByPk(participantId);
  if (!participant) throw new Error('Participant not found');

  // Add budget overview
  doc.fontSize(14).text('Budget Overview');
  doc.fontSize(12);
  doc.text(`Total Budget: $${participant.planBudget}`);
  doc.text(`Budget Remaining: $${participant.planBudget - calculateSpentBudget(participantId, startDate, endDate)}`);
  doc.text(`Budget Utilization: ${calculateBudgetUtilization(participant.planBudget, calculateSpentBudget(participantId, startDate, endDate))}%`);
  doc.moveDown();

  // Add spending breakdown
  doc.fontSize(14).text('Spending Breakdown');
  doc.fontSize(12);
  const spendingBreakdown = await getSpendingBreakdown(participantId, startDate, endDate);
  Object.entries(spendingBreakdown).forEach(([category, amount]) => {
    doc.text(`${category}: $${amount}`);
  });

  doc.end();
  return filePath;
}

// Generate Health Metrics Report
async function generateHealthMetrics(participantId, startDate, endDate) {
  const doc = new PDFDocument();
  const fileName = `health-metrics-${participantId}-${Date.now()}.pdf`;
  const filePath = path.join(process.env.UPLOAD_DIR, fileName);

  doc.pipe(fs.createWriteStream(filePath));

  // Add report header
  doc.fontSize(20).text('Health Metrics Report', { align: 'center' });
  doc.moveDown();

  // Add date range
  doc.fontSize(12).text(`Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`);
  doc.moveDown();

  // Fetch health data
  const healthData = await getHealthData(participantId, startDate, endDate);

  // Add vital signs
  doc.fontSize(14).text('Vital Signs');
  doc.fontSize(12);
  Object.entries(healthData.vitalSigns).forEach(([metric, value]) => {
    doc.text(`${metric}: ${value}`);
  });
  doc.moveDown();

  // Add medication adherence
  doc.fontSize(14).text('Medication Adherence');
  doc.fontSize(12);
  doc.text(`Adherence Rate: ${healthData.medicationAdherence}%`);
  doc.text(`Missed Doses: ${healthData.missedDoses}`);
  doc.moveDown();

  // Add health incidents
  doc.fontSize(14).text('Health Incidents');
  doc.fontSize(12);
  doc.text(`Total Incidents: ${healthData.totalIncidents}`);
  doc.text(`Severity Distribution: ${healthData.severityDistribution}`);
  doc.text(`Most Common Issues: ${healthData.commonIssues}`);

  doc.end();
  return filePath;
}

// Helper functions
function calculateAverageDuration(careNotes) {
  if (careNotes.length === 0) return 0;
  const totalDuration = careNotes.reduce((sum, note) => sum + note.duration, 0);
  return Math.round(totalDuration / careNotes.length);
}

function getMostCommonActivities(careNotes) {
  const activities = careNotes.reduce((acc, note) => {
    acc[note.activity] = (acc[note.activity] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(activities)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([activity]) => activity)
    .join(', ');
}

function getSeverityDistribution(incidents) {
  const distribution = incidents.reduce((acc, incident) => {
    acc[incident.severity] = (acc[incident.severity] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(distribution)
    .map(([severity, count]) => `${severity}: ${count}`)
    .join(', ');
}

function getMostCommonIncidents(incidents) {
  const types = incidents.reduce((acc, incident) => {
    acc[incident.type] = (acc[incident.type] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(types)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([type]) => type)
    .join(', ');
}

function calculateActualCareHours(careNotes) {
  return careNotes.reduce((sum, note) => sum + (note.duration / 60), 0);
}

function calculateComplianceRate(required, actual) {
  return Math.round((actual / required) * 100);
}

async function getIncidentReportCount(participantId, startDate, endDate) {
  return await IncidentReport.count({
    where: {
      participantId,
      incidentDate: {
        [sequelize.Op.between]: [startDate, endDate]
      }
    }
  });
}

async function getAppointmentCount(participantId, startDate, endDate) {
  return await Appointment.count({
    where: {
      participantId,
      date: {
        [sequelize.Op.between]: [startDate, endDate]
      }
    }
  });
}

function calculateSpentBudget(participantId, startDate, endDate) {
  // Implement budget calculation logic
  return 0;
}

function calculateBudgetUtilization(total, spent) {
  return Math.round((spent / total) * 100);
}

async function getSpendingBreakdown(participantId, startDate, endDate) {
  // Implement spending breakdown logic
  return {};
}

async function getHealthData(participantId, startDate, endDate) {
  // Implement health data collection logic
  return {
    vitalSigns: {},
    medicationAdherence: 0,
    missedDoses: 0,
    totalIncidents: 0,
    severityDistribution: '',
    commonIssues: ''
  };
}

// Handle failed jobs
reports.on('failed', (job, error) => {
  logger.error(`Report job ${job.id} failed:`, error);
});

// Handle completed jobs
reports.on('completed', (job) => {
  logger.info(`Report job ${job.id} completed successfully`);
});

module.exports = reports; 