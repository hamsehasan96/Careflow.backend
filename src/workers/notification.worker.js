const path = require('path');
const { notifications } = require(path.join(__dirname, '..', 'config', 'queue'));
const logger = require(path.join(__dirname, '..', 'config', 'logger'));
const { User, Participant } = require(path.join(__dirname, '..', 'models'));

// Process notification jobs
notifications.process(async (job) => {
  const { type, data } = job.data;

  try {
    switch (type) {
      case 'SEND_SMS':
        await sendSMS(data);
        break;
      case 'SEND_PUSH':
        await sendPushNotification(data);
        break;
      case 'SEND_EMAIL':
        await sendEmail(data);
        break;
      case 'SEND_EMERGENCY':
        await sendEmergencyNotification(data);
        break;
      default:
        throw new Error(`Unknown notification job type: ${type}`);
    }

    logger.info(`Notification job ${type} completed successfully`);
    return { success: true };
  } catch (error) {
    logger.error(`Notification job ${type} failed:`, error);
    throw error;
  }
});

// Send SMS notification
async function sendSMS(data) {
  const { phoneNumber, message } = data;

  try {
    // Implement SMS sending logic here
    logger.info(`Sending SMS to ${phoneNumber}: ${message}`);
    return true;
  } catch (error) {
    logger.error('Failed to send SMS:', error);
    throw error;
  }
}

// Send push notification
async function sendPushNotification(data) {
  const { userId, title, body } = data;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Implement push notification logic here
    logger.info(`Sending push notification to user ${userId}: ${title}`);
    return true;
  } catch (error) {
    logger.error('Failed to send push notification:', error);
    throw error;
  }
}

// Send email notification
async function sendEmail(data) {
  const { email, subject, content } = data;

  try {
    // Implement email sending logic here
    logger.info(`Sending email to ${email}: ${subject}`);
    return true;
  } catch (error) {
    logger.error('Failed to send email:', error);
    throw error;
  }
}

// Send emergency notification
async function sendEmergencyNotification(data) {
  const { participantId, message } = data;

  try {
    const participant = await Participant.findByPk(participantId);
    if (!participant) {
      throw new Error('Participant not found');
    }

    // Get emergency contacts
    const emergencyContacts = [
      {
        name: participant.emergencyContactName,
        phone: participant.emergencyContactPhone,
        relationship: participant.emergencyContactRelationship
      }
    ];

    // Send notifications to all emergency contacts
    for (const contact of emergencyContacts) {
      await sendSMS({
        phoneNumber: contact.phone,
        message: `EMERGENCY: ${message}`
      });
    }

    return true;
  } catch (error) {
    logger.error('Failed to send emergency notification:', error);
    throw error;
  }
}

// Handle failed jobs
notifications.on('failed', (job, error) => {
  logger.error(`Notification job ${job.id} failed:`, error);
});

// Handle completed jobs
notifications.on('completed', (job) => {
  logger.info(`Notification job ${job.id} completed successfully`);
});

module.exports = notifications; 