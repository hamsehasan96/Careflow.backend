const path = require('path');
const cron = require('node-cron');
const { ReminderService } = require(path.join(__dirname, 'reminder.service'));

class SchedulerService {
  constructor() {
    this.reminderService = new ReminderService();
    this.scheduledJobs = [];
  }

  // Start all scheduled jobs
  startAllJobs() {
    this.stopAllJobs(); // Clear any existing jobs
    this.scheduleAppointmentReminders();
    console.log('All scheduled jobs started');
  }

  // Stop all scheduled jobs
  stopAllJobs() {
    this.scheduledJobs.forEach(job => job.stop());
    this.scheduledJobs = [];
    console.log('All scheduled jobs stopped');
  }

  // Schedule appointment reminders to run every hour
  scheduleAppointmentReminders() {
    // Run every hour at minute 0
    const job = cron.schedule('0 * * * *', async () => {
      console.log('Running scheduled appointment reminders job:', new Date());
      try {
        const result = await this.reminderService.sendUpcomingAppointmentReminders();
        console.log('Appointment reminders job completed:', result);
      } catch (error) {
        console.error('Error in appointment reminders job:', error);
      }
    });

    this.scheduledJobs.push(job);
    console.log('Appointment reminders job scheduled');
    
    // Run immediately on startup for testing
    this.reminderService.sendUpcomingAppointmentReminders()
      .then(result => console.log('Initial appointment reminders sent:', result))
      .catch(error => console.error('Error sending initial reminders:', error));
  }
}

module.exports = SchedulerService;
