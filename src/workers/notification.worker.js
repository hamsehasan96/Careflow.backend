const { notifications } = require('../config/queue');
const logger = require('../config/logger');
const twilio = require('twilio');

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Process notification jobs
notifications.process(async (job) => {
  const { type, recipient, message, data } = job.data;

  try {
    switch (type) {
      case 'SMS':
        await sendSMS(recipient, message);
        break;
      case 'PUSH':
        await sendPushNotification(recipient, message, data);
        break;
      case 'EMERGENCY':
        await sendEmergencyNotification(recipient, message, data);
        break;
      default:
        throw new Error(`Unknown notification type: ${type}`);
    }

    logger.info(`${type} notification sent successfully to ${recipient}`);
    return { success: true };
  } catch (error) {
    logger.error(`Notification sending failed for ${type}:`, error);
    throw error;
  }
});

// Send SMS notification
async function sendSMS(to, message) {
  try {
    await twilioClient.messages.create({
      body: message,
      to: to,
      from: process.env.TWILIO_PHONE_NUMBER
    });
  } catch (error) {
    logger.error('SMS sending failed:', error);
    throw error;
  }
}

// Send push notification
async function sendPushNotification(recipient, message, data) {
  // Implement push notification logic here
  // This could use Firebase Cloud Messaging, Apple Push Notification Service, etc.
  logger.info(`Push notification would be sent to ${recipient}: ${message}`);
}

// Send emergency notification
async function sendEmergencyNotification(recipient, message, data) {
  try {
    // Send SMS
    await sendSMS(recipient, `EMERGENCY: ${message}`);
    
    // Send push notification
    await sendPushNotification(recipient, `EMERGENCY: ${message}`, data);
    
    // Log emergency
    logger.warn(`Emergency notification sent to ${recipient}: ${message}`);
  } catch (error) {
    logger.error('Emergency notification failed:', error);
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