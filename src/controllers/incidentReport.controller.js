const { validationResult } = require('express-validator');
const IncidentReport = require('../models/incidentReport.model');
const User = require('../models/user.model');
const Participant = require('../models/participant.model');

// Get all incident reports
exports.getAllIncidentReports = async (req, res) => {
  try {
    const incidentReports = await IncidentReport.findAll({
      include: [
        { model: User, as: 'reporter', attributes: ['id', 'firstName', 'lastName'] },
        { model: Participant, as: 'participant', attributes: ['id', 'firstName', 'lastName'] }
      ],
      order: [['incidentDate', 'DESC'], ['createdAt', 'DESC']]
    });
    
    res.status(200).json(incidentReports);
  } catch (error) {
    console.error('Error fetching incident reports:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get incident reports for a specific participant
exports.getParticipantIncidentReports = async (req, res) => {
  try {
    const incidentReports = await IncidentReport.findAll({
      where: { participantId: req.params.participantId },
      include: [
        { model: User, as: 'reporter', attributes: ['id', 'firstName', 'lastName'] }
      ],
      order: [['incidentDate', 'DESC'], ['createdAt', 'DESC']]
    });
    
    res.status(200).json(incidentReports);
  } catch (error) {
    console.error('Error fetching participant incident reports:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get incident reports by reporter
exports.getReporterIncidentReports = async (req, res) => {
  try {
    const incidentReports = await IncidentReport.findAll({
      where: { reporterId: req.params.reporterId },
      include: [
        { model: Participant, as: 'participant', attributes: ['id', 'firstName', 'lastName'] }
      ],
      order: [['incidentDate', 'DESC'], ['createdAt', 'DESC']]
    });
    
    res.status(200).json(incidentReports);
  } catch (error) {
    console.error('Error fetching reporter incident reports:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get incident report by ID
exports.getIncidentReportById = async (req, res) => {
  try {
    const incidentReport = await IncidentReport.findByPk(req.params.id, {
      include: [
        { model: User, as: 'reporter', attributes: ['id', 'firstName', 'lastName'] },
        { model: Participant, as: 'participant', attributes: ['id', 'firstName', 'lastName'] }
      ]
    });
    
    if (!incidentReport) {
      return res.status(404).json({ message: 'Incident report not found' });
    }
    
    res.status(200).json(incidentReport);
  } catch (error) {
    console.error('Error fetching incident report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new incident report
exports.createIncidentReport = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    // Add the current user as the reporter if not specified
    const newIncidentReport = await IncidentReport.create({
      ...req.body,
      reporterId: req.user ? req.user.id : req.body.reporterId // In production, always use req.user.id
    });
    
    // If this is a reportable incident, trigger notifications to relevant authorities
    if (req.body.reportedToNDIS || req.body.reportedToPolice) {
      // This would be implemented with a notification service in a production environment
      console.log(`Reportable incident created: ${newIncidentReport.id}`);
    }
    
    res.status(201).json(newIncidentReport);
  } catch (error) {
    console.error('Error creating incident report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update incident report
exports.updateIncidentReport = async (req, res) => {
  try {
    const incidentReport = await IncidentReport.findByPk(req.params.id);
    
    if (!incidentReport) {
      return res.status(404).json({ message: 'Incident report not found' });
    }
    
    // Check if the report is already closed
    if (incidentReport.status === 'closed') {
      return res.status(403).json({ message: 'Cannot update a closed incident report' });
    }
    
    await incidentReport.update(req.body);
    
    res.status(200).json(incidentReport);
  } catch (error) {
    console.error('Error updating incident report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Close incident report
exports.closeIncidentReport = async (req, res) => {
  try {
    const incidentReport = await IncidentReport.findByPk(req.params.id);
    
    if (!incidentReport) {
      return res.status(404).json({ message: 'Incident report not found' });
    }
    
    // Update status to closed
    await incidentReport.update({
      status: 'closed',
      followUpCompleted: true
    });
    
    res.status(200).json(incidentReport);
  } catch (error) {
    console.error('Error closing incident report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete incident report
exports.deleteIncidentReport = async (req, res) => {
  try {
    const incidentReport = await IncidentReport.findByPk(req.params.id);
    
    if (!incidentReport) {
      return res.status(404).json({ message: 'Incident report not found' });
    }
    
    // Check if the report is already submitted or closed
    if (incidentReport.status !== 'draft') {
      return res.status(403).json({ message: 'Cannot delete a submitted or closed incident report' });
    }
    
    await incidentReport.destroy();
    
    res.status(200).json({ message: 'Incident report deleted successfully' });
  } catch (error) {
    console.error('Error deleting incident report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
