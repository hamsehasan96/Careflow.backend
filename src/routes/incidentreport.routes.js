const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { 
  getAllIncidentReports, 
  getParticipantIncidentReports, 
  getReporterIncidentReports, 
  getIncidentReportById, 
  createIncidentReport, 
  updateIncidentReport, 
  closeIncidentReport, 
  deleteIncidentReport 
} = require('../controllers/incidentreport.controller');

// Get all incident reports
router.get(
  '/',
  // authMiddleware,
  getAllIncidentReports
);

// Get incident reports for a specific participant
router.get(
  '/participant/:participantId',
  // authMiddleware,
  getParticipantIncidentReports
);

// Get incident reports by reporter
router.get(
  '/reporter/:reporterId',
  // authMiddleware,
  getReporterIncidentReports
);

// Get incident report by ID
router.get(
  '/:id',
  // authMiddleware,
  getIncidentReportById
);

// Create new incident report
router.post(
  '/',
  // authMiddleware,
  [
    check('incidentDate', 'Incident date is required').not().isEmpty(),
    check('incidentTime', 'Incident time is required').not().isEmpty(),
    check('location', 'Location is required').not().isEmpty(),
    check('incidentType', 'Incident type is required').not().isEmpty(),
    check('severity', 'Severity is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('immediateActions', 'Immediate actions are required').not().isEmpty(),
    check('participantId', 'Participant ID is required').not().isEmpty()
  ],
  createIncidentReport
);

// Update incident report
router.put(
  '/:id',
  // authMiddleware,
  updateIncidentReport
);

// Close incident report
router.put(
  '/:id/close',
  // authMiddleware,
  closeIncidentReport
);

// Delete incident report
router.delete(
  '/:id',
  // authMiddleware,
  deleteIncidentReport
);

module.exports = router;
