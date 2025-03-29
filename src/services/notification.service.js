const twilio = require('twilio');
const nodemailer = require('nodemailer');
const logger = require('../config/logger');

// Initialize Twilio client
let twilioClient;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    logger.info('Twilio client initialized successfully');
  } else {
    logger.warn('Twilio credentials not provided, SMS notifications will be disabled');
  }
} catch (error) {
  logger.error('Failed to initialize Twilio client:', error);
}

// Initialize Email transporter
let emailTransporter;
try {
  if (process.env.EMAIL_HOST && process.env.EMAIL_PORT && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    emailTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    logger.info('Email transporter initialized successfully');
  } else {
    logger.warn('Email credentials not provided, email notifications will be disabled');
  }
} catch (error) {
  logger.error('Failed to initialize email transporter:', error);
}

/**
 * Send SMS notification
 * @param {string} phoneNumber - Recipient phone number (E.164 format)
 * @param {string} message - SMS message content
 * @returns {Promise} - Promise resolving to Twilio message object
 */
const sendSMS = async (phoneNumber, message) => {
  if (!twilioClient) {
    logger.error('Twilio client not initialized, cannot send SMS');
    throw new Error('SMS service not available');
  }

  try {
    // Validate phone number format (E.164)
    if (!phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
      logger.error(`Invalid phone number format: ${phoneNumber}`);
      throw new Error('Invalid phone number format. Must be in E.164 format (e.g., +61412345678)');
    }

    // Validate message length
    if (message.length > 1600) {
      logger.warn(`SMS message exceeds recommended length: ${message.length} characters`);
      message = message.substring(0, 1597) + '...';
    }

    // Send SMS via Twilio
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    logger.info(`SMS sent successfully to ${phoneNumber}, SID: ${result.sid}`);
    return result;
  } catch (error) {
    logger.error(`Failed to send SMS to ${phoneNumber}:`, error);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
};

/**
 * Send email notification
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML content
 * @param {string} text - Email plain text content (fallback)
 * @param {Array} attachments - Optional email attachments
 * @returns {Promise} - Promise resolving to nodemailer info object
 */
const sendEmail = async (to, subject, html, text, attachments = []) => {
  if (!emailTransporter) {
    logger.error('Email transporter not initialized, cannot send email');
    throw new Error('Email service not available');
  }

  try {
    // Validate email format
    if (!to.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      logger.error(`Invalid email format: ${to}`);
      throw new Error('Invalid email format');
    }

    // Prepare email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML tags for text version if not provided
      attachments
    };

    // Send email
    const info = await emailTransporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${to}, ID: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send appointment reminder
 * @param {Object} appointment - Appointment object
 * @param {Object} participant - Participant object
 * @param {Object} staff - Staff object
 * @param {string} method - Notification method ('sms', 'email', or 'both')
 * @returns {Promise} - Promise resolving to notification results
 */
const sendAppointmentReminder = async (appointment, participant, staff, method = 'both') => {
  const results = {};
  const date = new Date(appointment.date).toLocaleDateString('en-AU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Prepare message content
  const subject = `Reminder: Appointment on ${date} at ${appointment.startTime}`;
  const message = `Hello ${participant.name},\n\nThis is a reminder about your appointment with ${staff.name} on ${date} at ${appointment.startTime}.\n\nService: ${appointment.service}\nLocation: ${appointment.location || 'Not specified'}\n\nIf you need to reschedule, please call us at ${process.env.ORGANIZATION_PHONE || 'our office'}.\n\nRegards,\nCareFlow Team`;
  
  const htmlMessage = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a6da7;">Appointment Reminder</h2>
      <p>Hello ${participant.name},</p>
      <p>This is a reminder about your upcoming appointment:</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${appointment.startTime}</p>
        <p><strong>Provider:</strong> ${staff.name}</p>
        <p><strong>Service:</strong> ${appointment.service}</p>
        <p><strong>Location:</strong> ${appointment.location || 'Not specified'}</p>
      </div>
      <p>If you need to reschedule, please call us at ${process.env.ORGANIZATION_PHONE || 'our office'}.</p>
      <p>Regards,<br>CareFlow Team</p>
    </div>
  `;

  try {
    // Send SMS if requested and phone number is available
    if ((method === 'sms' || method === 'both') && participant.contactNumber) {
      results.sms = await sendSMS(participant.contactNumber, message);
    }
    
    // Send email if requested and email is available
    if ((method === 'email' || method === 'both') && participant.email) {
      results.email = await sendEmail(participant.email, subject, htmlMessage, message);
    }
    
    return results;
  } catch (error) {
    logger.error('Failed to send appointment reminder:', error);
    throw error;
  }
};

/**
 * Send notification based on user preferences
 * @param {Object} user - User object with notification preferences
 * @param {string} subject - Notification subject
 * @param {string} message - Notification message
 * @param {string} htmlMessage - HTML version of the message (for email)
 * @returns {Promise} - Promise resolving to notification results
 */
const sendUserNotification = async (user, subject, message, htmlMessage) => {
  const results = {};
  const preferences = user.notificationPreferences || { email: true, sms: true, inApp: true };
  
  try {
    // Send SMS if enabled in preferences and phone number is available
    if (preferences.sms && user.contactNumber) {
      results.sms = await sendSMS(user.contactNumber, message);
    }
    
    // Send email if enabled in preferences and email is available
    if (preferences.email && user.email) {
      results.email = await sendEmail(user.email, subject, htmlMessage || message, message);
    }
    
    // Store in-app notification if enabled in preferences
    if (preferences.inApp) {
      // This would typically store the notification in a database
      // For now, we'll just log it
      logger.info(`In-app notification for user ${user.id}: ${subject}`);
      results.inApp = { success: true, timestamp: new Date() };
    }
    
    return results;
  } catch (error) {
    logger.error(`Failed to send notification to user ${user.id}:`, error);
    throw error;
  }
};

module.exports = {
  sendSMS,
  sendEmail,
  sendAppointmentReminder,
  sendUserNotification
};
