const path = require('path');
const { reports } = require(path.join(__dirname, '..', 'config', 'queue'));
const logger = require(path.join(__dirname, '..', 'config', 'logger'));
const { sequelize } = require(path.join(__dirname, '..', 'config', 'database'));
const { Participant, CareNote, Appointment, IncidentReport } = require(path.join(__dirname, '..', 'models'));
const PDFDocument = require('pdfkit');
const fs = require('fs');

// Process report jobs
reports.process(async (job) => {
  const { type, data } = job.data;

  try {
    switch (type) {
      case 'GENERATE_PARTICIPANT_REPORT':
        await generateParticipantReport(data);
        break;
      case 'GENERATE_APPOINTMENT_REPORT':
        await generateAppointmentReport(data);
        break;
      case 'GENERATE_INCIDENT_REPORT':
        await generateIncidentReport(data);
        break;
      default:
        throw new Error(`Unknown report job type: ${type}`);
    }

    logger.info(`Report job ${type} completed successfully`);
    return { success: true };
  } catch (error) {
    logger.error(`Report job ${type} failed:`, error);
    throw error;
  }
});

// Generate participant report
async function generateParticipantReport(data) {
  const { participantId, period } = data;

  try {
    const participant = await Participant.findByPk(participantId);
    if (!participant) {
      throw new Error('Participant not found');
    }

    // Get all care notes and appointments for the period
    const [careNotes, appointments] = await Promise.all([
      CareNote.findAll({
        where: {
          participantId,
          createdAt: {
            [sequelize.Op.between]: [period.start, period.end]
          }
        }
      }),
      Appointment.findAll({
        where: {
          participantId,
          startTime: {
            [sequelize.Op.between]: [period.start, period.end]
          }
        }
      })
    ]);

    // Generate PDF report
    const pdfPath = await generateParticipantPDF(participant, careNotes, appointments, period);

    return pdfPath;
  } catch (error) {
    logger.error('Failed to generate participant report:', error);
    throw error;
  }
}

// Generate appointment report
async function generateAppointmentReport(data) {
  const { period } = data;

  try {
    const appointments = await Appointment.findAll({
      where: {
        startTime: {
          [sequelize.Op.between]: [period.start, period.end]
        }
      },
      include: [{ model: Participant }]
    });

    // Generate PDF report
    const pdfPath = await generateAppointmentPDF(appointments, period);

    return pdfPath;
  } catch (error) {
    logger.error('Failed to generate appointment report:', error);
    throw error;
  }
}

// Generate incident report
async function generateIncidentReport(data) {
  const { period } = data;

  try {
    const incidents = await IncidentReport.findAll({
      where: {
        createdAt: {
          [sequelize.Op.between]: [period.start, period.end]
        }
      },
      include: [{ model: Participant }]
    });

    // Generate PDF report
    const pdfPath = await generateIncidentPDF(incidents, period);

    return pdfPath;
  } catch (error) {
    logger.error('Failed to generate incident report:', error);
    throw error;
  }
}

// Helper functions
async function generateParticipantPDF(participant, careNotes, appointments, period) {
  const doc = new PDFDocument();
  const fileName = `participant-report-${participant.id}-${Date.now()}.pdf`;
  const filePath = path.join(process.env.UPLOAD_DIR, fileName);

  doc.pipe(fs.createWriteStream(filePath));

  // Add report header
  doc.fontSize(20).text('Participant Report', { align: 'center' });
  doc.moveDown();

  // Add participant details
  doc.fontSize(12).text(`Participant: ${participant.name}`);
  doc.text(`NDIS Number: ${participant.ndisNumber}`);
  doc.text(`Period: ${new Date(period.start).toLocaleDateString()} - ${new Date(period.end).toLocaleDateString()}`);
  doc.moveDown();

  // Add care notes summary
  doc.fontSize(14).text('Care Notes');
  doc.fontSize(12);
  careNotes.forEach(note => {
    doc.text(`Date: ${new Date(note.createdAt).toLocaleDateString()}`);
    doc.text(`Type: ${note.noteType}`);
    doc.text(`Content: ${note.content}`);
    doc.moveDown();
  });

  // Add appointments summary
  doc.fontSize(14).text('Appointments');
  doc.fontSize(12);
  appointments.forEach(appointment => {
    doc.text(`Date: ${new Date(appointment.startTime).toLocaleDateString()}`);
    doc.text(`Title: ${appointment.title}`);
    doc.text(`Status: ${appointment.status}`);
    doc.moveDown();
  });

  doc.end();
  return filePath;
}

async function generateAppointmentPDF(appointments, period) {
  const doc = new PDFDocument();
  const fileName = `appointment-report-${Date.now()}.pdf`;
  const filePath = path.join(process.env.UPLOAD_DIR, fileName);

  doc.pipe(fs.createWriteStream(filePath));

  // Add report header
  doc.fontSize(20).text('Appointment Report', { align: 'center' });
  doc.moveDown();

  // Add period
  doc.fontSize(12).text(`Period: ${new Date(period.start).toLocaleDateString()} - ${new Date(period.end).toLocaleDateString()}`);
  doc.moveDown();

  // Add appointments summary
  doc.fontSize(14).text('Appointments');
  doc.fontSize(12);
  appointments.forEach(appointment => {
    doc.text(`Participant: ${appointment.Participant.name}`);
    doc.text(`Date: ${new Date(appointment.startTime).toLocaleDateString()}`);
    doc.text(`Title: ${appointment.title}`);
    doc.text(`Status: ${appointment.status}`);
    doc.moveDown();
  });

  doc.end();
  return filePath;
}

async function generateIncidentPDF(incidents, period) {
  const doc = new PDFDocument();
  const fileName = `incident-report-${Date.now()}.pdf`;
  const filePath = path.join(process.env.UPLOAD_DIR, fileName);

  doc.pipe(fs.createWriteStream(filePath));

  // Add report header
  doc.fontSize(20).text('Incident Report', { align: 'center' });
  doc.moveDown();

  // Add period
  doc.fontSize(12).text(`Period: ${new Date(period.start).toLocaleDateString()} - ${new Date(period.end).toLocaleDateString()}`);
  doc.moveDown();

  // Add incidents summary
  doc.fontSize(14).text('Incidents');
  doc.fontSize(12);
  incidents.forEach(incident => {
    doc.text(`Participant: ${incident.Participant.name}`);
    doc.text(`Date: ${new Date(incident.createdAt).toLocaleDateString()}`);
    doc.text(`Type: ${incident.type}`);
    doc.text(`Severity: ${incident.severity}`);
    doc.text(`Description: ${incident.description}`);
    doc.moveDown();
  });

  doc.end();
  return filePath;
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