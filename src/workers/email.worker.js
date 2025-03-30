const { email } = require('../config/queue');
const logger = require('../config/logger');
const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Process email jobs
email.process(async (job) => {
  const { to, subject, html, text } = job.data;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
      text
    });

    logger.info(`Email sent successfully to ${to}`);
    return { success: true };
  } catch (error) {
    logger.error('Email sending failed:', error);
    throw error;
  }
});

// Handle failed jobs
email.on('failed', (job, error) => {
  logger.error(`Email job ${job.id} failed:`, error);
});

// Handle completed jobs
email.on('completed', (job) => {
  logger.info(`Email job ${job.id} completed successfully`);
});

module.exports = email; 