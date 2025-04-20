const { validationResult } = require('express-validator');
const path = require('path');
const modelsPath = path.join(__dirname, '..', 'models');
const Appointment = require(path.join(modelsPath, 'appointment.model'));
const User = require(path.join(modelsPath, 'user.model'));
const Participant = require(path.join(modelsPath, 'participant.model'));

// Get all appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        { model: User, as: 'staff', attributes: ['id', 'firstName', 'lastName'] },
        { model: Participant, as: 'participant', attributes: ['id', 'firstName', 'lastName'] }
      ]
    });
    
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get appointments by date range
exports.getAppointmentsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    const appointments = await Appointment.findAll({
      where: {
        startTime: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      },
      include: [
        { model: User, as: 'staff', attributes: ['id', 'firstName', 'lastName'] },
        { model: Participant, as: 'participant', attributes: ['id', 'firstName', 'lastName'] }
      ]
    });
    
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments by date range:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get appointments for a specific staff member
exports.getStaffAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { staffId: req.params.staffId },
      include: [
        { model: Participant, as: 'participant', attributes: ['id', 'firstName', 'lastName'] }
      ]
    });
    
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching staff appointments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get appointments for a specific participant
exports.getParticipantAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { participantId: req.params.participantId },
      include: [
        { model: User, as: 'staff', attributes: ['id', 'firstName', 'lastName'] }
      ]
    });
    
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching participant appointments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get appointment by ID
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        { model: User, as: 'staff', attributes: ['id', 'firstName', 'lastName'] },
        { model: Participant, as: 'participant', attributes: ['id', 'firstName', 'lastName'] }
      ]
    });
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.status(200).json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new appointment
exports.createAppointment = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const newAppointment = await Appointment.create(req.body);
    
    // If it's a recurring appointment, create the series
    if (req.body.isRecurring && req.body.recurringPattern) {
      await createRecurringAppointments(newAppointment, req.body);
    }
    
    // Send appointment reminder if requested
    if (req.body.sendReminder) {
      // This would be implemented with a message queue in a production environment
      // For now, we'll just log it
      console.log(`Reminder scheduled for appointment ${newAppointment.id}`);
    }
    
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update appointment
exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    await appointment.update(req.body);
    
    // Update recurring appointments if needed
    if (req.body.updateSeries && appointment.isRecurring) {
      // This would update all future appointments in the series
      // Implementation would depend on how recurring appointments are tracked
    }
    
    // Update reminder if needed
    if (req.body.sendReminder !== undefined) {
      // Update reminder settings
    }
    
    res.status(200).json(appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Delete all future recurring appointments if requested
    if (req.query.deleteSeries && appointment.isRecurring) {
      // This would delete all future appointments in the series
      // Implementation would depend on how recurring appointments are tracked
    }
    
    await appointment.destroy();
    
    res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to create recurring appointments
const createRecurringAppointments = async (baseAppointment, appointmentData) => {
  const { recurringPattern } = appointmentData;
  const startDate = new Date(baseAppointment.startTime);
  const endDate = new Date(baseAppointment.endTime);
  const duration = endDate - startDate; // Duration in milliseconds
  
  // Create appointments for the next 3 months (adjust as needed)
  const recurringAppointments = [];
  let currentDate = new Date(startDate);
  
  // Add 3 months to the start date to determine the end of the recurring series
  const seriesEndDate = new Date(startDate);
  seriesEndDate.setMonth(seriesEndDate.getMonth() + 3);
  
  while (currentDate < seriesEndDate) {
    // Skip the first occurrence as it's already created
    if (currentDate > startDate) {
      const newStartTime = new Date(currentDate);
      const newEndTime = new Date(newStartTime.getTime() + duration);
      
      const appointmentData = {
        title: baseAppointment.title,
        startTime: newStartTime,
        endTime: newEndTime,
        location: baseAppointment.location,
        description: baseAppointment.description,
        status: baseAppointment.status,
        isRecurring: true,
        recurringPattern: baseAppointment.recurringPattern,
        ndisLineItem: baseAppointment.ndisLineItem,
        notes: baseAppointment.notes,
        participantId: baseAppointment.participantId,
        staffId: baseAppointment.staffId
      };
      
      recurringAppointments.push(appointmentData);
    }
    
    // Increment the date based on the recurring pattern
    switch (recurringPattern) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'fortnightly':
        currentDate.setDate(currentDate.getDate() + 14);
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      default:
        break;
    }
  }
  
  // Bulk create the recurring appointments
  if (recurringAppointments.length > 0) {
    await Appointment.bulkCreate(recurringAppointments);
  }
};
