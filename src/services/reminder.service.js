const nodemailer = require('nodemailer');
const path = require('path');
const { Appointment, User, Participant } = require(path.join(__dirname, '..', 'models'));
const { Op } = require('sequelize');

// Email service for sending appointment reminders
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Send a single email
  async sendEmail(to, subject, html) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send appointment reminder email
  async sendAppointmentReminder(appointment, participant, staff) {
    const startTime = new Date(appointment.startTime).toLocaleString();
    const endTime = new Date(appointment.endTime).toLocaleTimeString();
    
    const subject = `Reminder: Upcoming Appointment on ${startTime}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1976d2; color: white; padding: 20px; text-align: center;">
          <h1>Appointment Reminder</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
          <p>Hello ${participant.User.firstName},</p>
          <p>This is a reminder about your upcoming appointment:</p>
          <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;">
            <p><strong>Title:</strong> ${appointment.title}</p>
            <p><strong>Date & Time:</strong> ${startTime} - ${endTime}</p>
            <p><strong>Location:</strong> ${appointment.location}</p>
            <p><strong>Support Worker:</strong> ${staff.firstName} ${staff.lastName}</p>
            ${appointment.description ? `<p><strong>Description:</strong> ${appointment.description}</p>` : ''}
          </div>
          <p>If you need to reschedule or have any questions, please contact us at ${process.env.EMAIL_USER} or call your support coordinator.</p>
          <p>Thank you for using CareFlow!</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; color: #666;">
          <p>© ${new Date().getFullYear()} CareFlow NDIS Support Platform</p>
        </div>
      </div>
    `;
    
    return this.sendEmail(participant.User.email, subject, html);
  }
}

// SMS service for sending appointment reminders
class SMSService {
  constructor() {
    // This would typically be initialized with an SMS API client
    // For MVP, we'll just log the SMS messages
    this.apiKey = process.env.SMS_API_KEY;
    this.from = process.env.SMS_FROM;
  }

  // Send a single SMS
  async sendSMS(to, message) {
    try {
      // In a real implementation, this would call an SMS API
      // For MVP, we'll just log the message
      console.log(`SMS to ${to}: ${message}`);
      console.log(`From: ${this.from}, API Key: ${this.apiKey}`);
      
      // Simulate successful sending
      return { success: true, messageId: `sms_${Date.now()}` };
    } catch (error) {
      console.error('Error sending SMS:', error);
      return { success: false, error: error.message };
    }
  }

  // Send appointment reminder SMS
  async sendAppointmentReminder(appointment, participant, staff) {
    const startTime = new Date(appointment.startTime).toLocaleString();
    
    const message = `
      CareFlow Reminder: You have an appointment "${appointment.title}" on ${startTime} at ${appointment.location} with ${staff.firstName} ${staff.lastName}. Reply Y to confirm.
    `;
    
    return this.sendSMS(participant.User.phone, message);
  }
}

// Reminder service that coordinates email and SMS reminders
class ReminderService {
  constructor() {
    this.emailService = new EmailService();
    this.smsService = new SMSService();
  }

  // Send reminders for appointments within the next 24 hours
  async sendUpcomingAppointmentReminders() {
    try {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Find appointments in the next 24 hours that haven't had reminders sent
      const appointments = await Appointment.findAll({
        where: {
          startTime: {
            [Op.gte]: now,
            [Op.lt]: tomorrow
          },
          reminderSent: false,
          status: {
            [Op.notIn]: ['cancelled', 'no_show']
          }
        },
        include: [
          {
            model: Participant,
            include: [{ model: User }]
          },
          {
            model: User,
            as: 'Staff'
          }
        ]
      });
      
      console.log(`Found ${appointments.length} appointments for reminders`);
      
      const results = [];
      
      for (const appointment of appointments) {
        const participant = appointment.Participant;
        const staff = appointment.Staff;
        
        if (!participant || !participant.User || !staff) {
          console.warn(`Missing participant or staff data for appointment ${appointment.id}`);
          continue;
        }
        
        // Send email reminder
        const emailResult = await this.emailService.sendAppointmentReminder(
          appointment,
          participant,
          staff
        );
        
        // Send SMS reminder if participant has a phone number
        let smsResult = { success: false, reason: 'No phone number' };
        if (participant.User.phone) {
          smsResult = await this.smsService.sendAppointmentReminder(
            appointment,
            participant,
            staff
          );
        }
        
        // Mark reminder as sent
        if (emailResult.success || smsResult.success) {
          await appointment.update({ reminderSent: true });
        }
        
        results.push({
          appointmentId: appointment.id,
          participantId: participant.id,
          emailResult,
          smsResult
        });
      }
      
      return {
        success: true,
        total: appointments.length,
        results
      };
    } catch (error) {
      console.error('Error sending appointment reminders:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = {
  EmailService,
  SMSService,
  ReminderService
};
