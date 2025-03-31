const path = require('path');
const { scheduler } = require(path.join(__dirname, '..', 'config', 'queue'));
const logger = require(path.join(__dirname, '..', 'config', 'logger'));
const { sequelize } = require(path.join(__dirname, '..', 'config', 'database'));
const { Appointment, CareTask, Participant, CareWorker } = require(path.join(__dirname, '..', 'models'));
const { notifications } = require(path.join(__dirname, 'notification.worker'));

// Process scheduler jobs
scheduler.process(async (job) => {
  const { type, data } = job.data;

  try {
    switch (type) {
      case 'CREATE_APPOINTMENT':
        await createAppointment(data);
        break;
      case 'UPDATE_APPOINTMENT':
        await updateAppointment(data);
        break;
      case 'CANCEL_APPOINTMENT':
        await cancelAppointment(data);
        break;
      case 'ASSIGN_CARE_TASK':
        await assignCareTask(data);
        break;
      case 'CHECK_UPCOMING_APPOINTMENTS':
        await checkUpcomingAppointments();
        break;
      case 'CHECK_OVERDUE_TASKS':
        await checkOverdueTasks();
        break;
      default:
        throw new Error(`Unknown scheduler job type: ${type}`);
    }

    logger.info(`Scheduler job ${type} completed successfully`);
    return { success: true };
  } catch (error) {
    logger.error(`Scheduler job ${type} failed:`, error);
    throw error;
  }
});

// Create new appointment
async function createAppointment(data) {
  const { participantId, careWorkerId, date, duration, type, notes } = data;

  try {
    // Check for conflicts
    const conflicts = await checkAppointmentConflicts(careWorkerId, date, duration);
    if (conflicts.length > 0) {
      throw new Error('Appointment conflicts with existing schedule');
    }

    // Create appointment
    const appointment = await Appointment.create({
      participantId,
      careWorkerId,
      date,
      duration,
      type,
      notes,
      status: 'scheduled'
    });

    // Send notifications
    await sendAppointmentNotifications(appointment);

    return appointment;
  } catch (error) {
    logger.error('Failed to create appointment:', error);
    throw error;
  }
}

// Update existing appointment
async function updateAppointment(data) {
  const { appointmentId, updates } = data;

  try {
    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Check for conflicts if date/time is being updated
    if (updates.date || updates.duration) {
      const conflicts = await checkAppointmentConflicts(
        appointment.careWorkerId,
        updates.date || appointment.date,
        updates.duration || appointment.duration
      );
      if (conflicts.length > 0) {
        throw new Error('Updated appointment conflicts with existing schedule');
      }
    }

    // Update appointment
    await appointment.update(updates);

    // Send notifications
    await sendAppointmentNotifications(appointment);

    return appointment;
  } catch (error) {
    logger.error('Failed to update appointment:', error);
    throw error;
  }
}

// Cancel appointment
async function cancelAppointment(data) {
  const { appointmentId, reason } = data;

  try {
    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Update appointment status
    await appointment.update({
      status: 'cancelled',
      cancellationReason: reason
    });

    // Send cancellation notifications
    await sendCancellationNotifications(appointment, reason);

    return appointment;
  } catch (error) {
    logger.error('Failed to cancel appointment:', error);
    throw error;
  }
}

// Assign care task
async function assignCareTask(data) {
  const { taskId, careWorkerId, dueDate, priority } = data;

  try {
    const task = await CareTask.findByPk(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Update task assignment
    await task.update({
      assignedTo: careWorkerId,
      dueDate,
      priority,
      status: 'assigned'
    });

    // Send task assignment notification
    await sendTaskAssignmentNotification(task);

    return task;
  } catch (error) {
    logger.error('Failed to assign care task:', error);
    throw error;
  }
}

// Check upcoming appointments
async function checkUpcomingAppointments() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    const upcomingAppointments = await Appointment.findAll({
      where: {
        date: {
          [sequelize.Op.between]: [now, tomorrow]
        },
        status: 'scheduled'
      },
      include: [
        { model: Participant },
        { model: CareWorker }
      ]
    });

    // Send reminders for upcoming appointments
    for (const appointment of upcomingAppointments) {
      await sendAppointmentReminder(appointment);
    }

    return upcomingAppointments;
  } catch (error) {
    logger.error('Failed to check upcoming appointments:', error);
    throw error;
  }
}

// Check overdue tasks
async function checkOverdueTasks() {
  const now = new Date();

  try {
    const overdueTasks = await CareTask.findAll({
      where: {
        dueDate: {
          [sequelize.Op.lt]: now
        },
        status: {
          [sequelize.Op.in]: ['assigned', 'in_progress']
        }
      },
      include: [
        { model: Participant },
        { model: CareWorker }
      ]
    });

    // Send overdue task notifications
    for (const task of overdueTasks) {
      await sendOverdueTaskNotification(task);
    }

    return overdueTasks;
  } catch (error) {
    logger.error('Failed to check overdue tasks:', error);
    throw error;
  }
}

// Helper functions
async function checkAppointmentConflicts(careWorkerId, date, duration) {
  const startTime = new Date(date);
  const endTime = new Date(startTime.getTime() + duration * 60000);

  return await Appointment.findAll({
    where: {
      careWorkerId,
      status: 'scheduled',
      [sequelize.Op.or]: [
        {
          date: {
            [sequelize.Op.between]: [startTime, endTime]
          }
        },
        {
          date: {
            [sequelize.Op.lte]: startTime
          },
          [sequelize.literal]: `date + (duration * interval '1 minute') > '${startTime.toISOString()}'`
        }
      ]
    }
  });
}

async function sendAppointmentNotifications(appointment) {
  const { Participant, CareWorker } = appointment;
  
  // Send to participant
  await notifications.add('APPOINTMENT_CREATED', {
    type: 'PUSH',
    recipient: Participant.id,
    message: `New appointment scheduled for ${new Date(appointment.date).toLocaleString()}`,
    data: { appointmentId: appointment.id }
  });

  // Send to care worker
  await notifications.add('APPOINTMENT_CREATED', {
    type: 'PUSH',
    recipient: CareWorker.id,
    message: `New appointment with ${Participant.name} scheduled for ${new Date(appointment.date).toLocaleString()}`,
    data: { appointmentId: appointment.id }
  });
}

async function sendCancellationNotifications(appointment, reason) {
  const { Participant, CareWorker } = appointment;
  
  // Send to participant
  await notifications.add('APPOINTMENT_CANCELLED', {
    type: 'PUSH',
    recipient: Participant.id,
    message: `Appointment scheduled for ${new Date(appointment.date).toLocaleString()} has been cancelled. Reason: ${reason}`,
    data: { appointmentId: appointment.id }
  });

  // Send to care worker
  await notifications.add('APPOINTMENT_CANCELLED', {
    type: 'PUSH',
    recipient: CareWorker.id,
    message: `Appointment with ${Participant.name} has been cancelled. Reason: ${reason}`,
    data: { appointmentId: appointment.id }
  });
}

async function sendTaskAssignmentNotification(task) {
  const { Participant, CareWorker } = task;
  
  await notifications.add('TASK_ASSIGNED', {
    type: 'PUSH',
    recipient: CareWorker.id,
    message: `New task assigned: ${task.description} for ${Participant.name}`,
    data: { taskId: task.id }
  });
}

async function sendAppointmentReminder(appointment) {
  const { Participant, CareWorker } = appointment;
  
  // Send to participant
  await notifications.add('APPOINTMENT_REMINDER', {
    type: 'PUSH',
    recipient: Participant.id,
    message: `Reminder: You have an appointment scheduled for ${new Date(appointment.date).toLocaleString()}`,
    data: { appointmentId: appointment.id }
  });

  // Send to care worker
  await notifications.add('APPOINTMENT_REMINDER', {
    type: 'PUSH',
    recipient: CareWorker.id,
    message: `Reminder: You have an appointment with ${Participant.name} scheduled for ${new Date(appointment.date).toLocaleString()}`,
    data: { appointmentId: appointment.id }
  });
}

async function sendOverdueTaskNotification(task) {
  const { Participant, CareWorker } = task;
  
  await notifications.add('TASK_OVERDUE', {
    type: 'PUSH',
    recipient: CareWorker.id,
    message: `Task overdue: ${task.description} for ${Participant.name}`,
    data: { taskId: task.id }
  });
}

// Handle failed jobs
scheduler.on('failed', (job, error) => {
  logger.error(`Scheduler job ${job.id} failed:`, error);
});

// Handle completed jobs
scheduler.on('completed', (job) => {
  logger.info(`Scheduler job ${job.id} completed successfully`);
});

module.exports = scheduler; 