const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const incidentReportController = require('../controllers/incidentreport.controller');

// Get all incident reports
router.get(
  '/',
  // authMiddleware,
  incidentReportController.getAllIncidentReports
);

// Get incident reports for a specific participant
router.get(
  '/participant/:participantId',
  // authMiddleware,
  incidentReportController.getParticipantIncidentReports
);

// Get incident reports by reporter
router.get(
  '/reporter/:reporterId',
  // authMiddleware,
  incidentReportController.getReporterIncidentReports
);

// Get incident report by ID
router.get(
  '/:id',
  // authMiddleware,
  incidentReportController.getIncidentReportById
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
  incidentReportController.createIncidentReport
);

// Update incident report
router.put(
  '/:id',
  // authMiddleware,
  incidentReportController.updateIncidentReport
);

// Close incident report
router.put(
  '/:id/close',
  // authMiddleware,
  incidentReportController.closeIncidentReport
);

// Delete incident report
router.delete(
  '/:id',
  // authMiddleware,
  incidentReportController.deleteIncidentReport
);

module.exports = router;
