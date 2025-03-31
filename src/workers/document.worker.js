const path = require('path');
const { documents } = require(path.join(__dirname, '..', 'config', 'queue'));
const logger = require(path.join(__dirname, '..', 'config', 'logger'));
const PDFDocument = require('pdfkit');
const fs = require('fs');

// Process document jobs
documents.process(async (job) => {
  const { type, data, participantId } = job.data;

  try {
    switch (type) {
      case 'NDIS_PLAN':
        await generateNDISPlan(data, participantId);
        break;
      case 'CARE_REPORT':
        await generateCareReport(data, participantId);
        break;
      case 'INCIDENT_REPORT':
        await generateIncidentReport(data, participantId);
        break;
      default:
        throw new Error(`Unknown document type: ${type}`);
    }

    logger.info(`Document ${type} generated successfully for participant ${participantId}`);
    return { success: true };
  } catch (error) {
    logger.error(`Document generation failed for ${type}:`, error);
    throw error;
  }
});

// Generate NDIS Plan document
async function generateNDISPlan(data, participantId) {
  const doc = new PDFDocument();
  const fileName = `ndis-plan-${participantId}-${Date.now()}.pdf`;
  const filePath = path.join(process.env.UPLOAD_DIR, fileName);

  doc.pipe(fs.createWriteStream(filePath));

  // Add NDIS branding
  doc.fontSize(20).text('NDIS Plan', { align: 'center' });
  doc.moveDown();

  // Add participant details
  doc.fontSize(12).text(`Participant ID: ${participantId}`);
  doc.text(`Generated Date: ${new Date().toLocaleDateString()}`);
  doc.moveDown();

  // Add plan details
  doc.fontSize(14).text('Plan Details');
  doc.fontSize(12);
  Object.entries(data).forEach(([key, value]) => {
    doc.text(`${key}: ${value}`);
  });

  doc.end();
  return filePath;
}

// Generate Care Report document
async function generateCareReport(data, participantId) {
  const doc = new PDFDocument();
  const fileName = `care-report-${participantId}-${Date.now()}.pdf`;
  const filePath = path.join(process.env.UPLOAD_DIR, fileName);

  doc.pipe(fs.createWriteStream(filePath));

  // Add report header
  doc.fontSize(20).text('Care Report', { align: 'center' });
  doc.moveDown();

  // Add participant details
  doc.fontSize(12).text(`Participant ID: ${participantId}`);
  doc.text(`Report Date: ${new Date().toLocaleDateString()}`);
  doc.moveDown();

  // Add care details
  doc.fontSize(14).text('Care Details');
  doc.fontSize(12);
  Object.entries(data).forEach(([key, value]) => {
    doc.text(`${key}: ${value}`);
  });

  doc.end();
  return filePath;
}

// Generate Incident Report document
async function generateIncidentReport(data, participantId) {
  const doc = new PDFDocument();
  const fileName = `incident-report-${participantId}-${Date.now()}.pdf`;
  const filePath = path.join(process.env.UPLOAD_DIR, fileName);

  doc.pipe(fs.createWriteStream(filePath));

  // Add report header
  doc.fontSize(20).text('Incident Report', { align: 'center' });
  doc.moveDown();

  // Add incident details
  doc.fontSize(12).text(`Participant ID: ${participantId}`);
  doc.text(`Incident Date: ${new Date(data.incidentDate).toLocaleDateString()}`);
  doc.text(`Reported Date: ${new Date().toLocaleDateString()}`);
  doc.moveDown();

  // Add incident details
  doc.fontSize(14).text('Incident Details');
  doc.fontSize(12);
  Object.entries(data).forEach(([key, value]) => {
    if (key !== 'incidentDate') {
      doc.text(`${key}: ${value}`);
    }
  });

  doc.end();
  return filePath;
}

// Handle failed jobs
documents.on('failed', (job, error) => {
  logger.error(`Document job ${job.id} failed:`, error);
});

// Handle completed jobs
documents.on('completed', (job) => {
  logger.info(`Document job ${job.id} completed successfully`);
});

module.exports = documents; 