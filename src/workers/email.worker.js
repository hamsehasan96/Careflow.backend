const path = require('path');
const { email } = require(path.join(__dirname, '..', 'config', 'queue'));
const logger = require(path.join(__dirname, '..', 'config', 'logger'));
const { User, Participant } = require(path.join(__dirname, '..', 'models'));
const nodemailer = require('nodemailer');

// Process email jobs
email.process(async (job) => {
  const { type, data } = job.data;

  try {
    switch (type) {
      case 'SEND_WELCOME_EMAIL':
        await sendWelcomeEmail(data);
        break;
      case 'SEND_PASSWORD_RESET':
        await sendPasswordResetEmail(data);
        break;
      case 'SEND_APPOINTMENT_REMINDER':
        await sendAppointmentReminder(data);
        break;
      case 'SEND_REPORT':
        await sendReportEmail(data);
        break;
      default:
        throw new Error(`Unknown email job type: ${type}`);
    }

    logger.info(`Email job ${type} completed successfully`);
    return { success: true };
  } catch (error) {
    logger.error(`Email job ${type} failed:`, error);
    throw error;
  }
});

// Send welcome email
async function sendWelcomeEmail(data) {
  const { userId } = data;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Implement welcome email logic here
    logger.info(`Sending welcome email to user ${userId}`);
    return true;
  } catch (error) {
    logger.error('Failed to send welcome email:', error);
    throw error;
  }
}

// Send password reset email
async function sendPasswordResetEmail(data) {
  const { userId, resetToken } = data;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Implement password reset email logic here
    logger.info(`Sending password reset email to user ${userId}`);
    return true;
  } catch (error) {
    logger.error('Failed to send password reset email:', error);
    throw error;
  }
}

// Send appointment reminder email
async function sendAppointmentReminder(data) {
  const { participantId, appointmentId } = data;

  try {
    const participant = await Participant.findByPk(participantId);
    if (!participant) {
      throw new Error('Participant not found');
    }

    // Implement appointment reminder email logic here
    logger.info(`Sending appointment reminder email to participant ${participantId}`);
    return true;
  } catch (error) {
    logger.error('Failed to send appointment reminder email:', error);
    throw error;
  }
}

// Send report email
async function sendReportEmail(data) {
  const { userId, reportPath, reportType } = data;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Implement report email logic here
    logger.info(`Sending ${reportType} report email to user ${userId}`);
    return true;
  } catch (error) {
    logger.error('Failed to send report email:', error);
    throw error;
  }
}

// Handle failed jobs
email.on('failed', (job, error) => {
  logger.error(`Email job ${job.id} failed:`, error);
});

// Handle completed jobs
email.on('completed', (job) => {
  logger.info(`Email job ${job.id} completed successfully`);
});

module.exports = email; 