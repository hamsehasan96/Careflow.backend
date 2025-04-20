const path = require('path');
const express = require('express');
const router = express.Router();
const { IncidentReport } = require(path.join(__dirname, '..', 'models'));
const { auth, checkRole } = require(path.join(__dirname, '..', 'middleware', 'auth.middleware'));
const { validate } = require(path.join(__dirname, '..', 'middleware', 'validate.middleware'));
const logger = require(path.join(__dirname, '..', 'config', 'logger'));

// Get all incident reports
router.get('/', auth, checkRole(['admin', 'care_worker']), async (req, res) => {
  try {
    const incidentReports = await IncidentReport.findAll({
      where: req.userRole === 'admin' ? {} : { reporterId: req.userId },
      include: ['participant', 'reporter'],
      order: [['createdAt', 'DESC']]
    });
    res.json(incidentReports);
  } catch (error) {
    logger.error('Error fetching incident reports:', error);
    res.status(500).json({ message: 'Error fetching incident reports' });
  }
});

// Get a single incident report
router.get('/:id', auth, checkRole(['admin', 'care_worker']), async (req, res) => {
  try {
    const incidentReport = await IncidentReport.findByPk(req.params.id, {
      include: ['participant', 'reporter']
    });
    if (!incidentReport) {
      return res.status(404).json({ message: 'Incident report not found' });
    }
    res.json(incidentReport);
  } catch (error) {
    logger.error('Error fetching incident report:', error);
    res.status(500).json({ message: 'Error fetching incident report' });
  }
});

// Create a new incident report
router.post('/', auth, checkRole(['care_worker']), validate, async (req, res) => {
  try {
    const incidentReport = await IncidentReport.create({
      ...req.body,
      reporterId: req.userId,
      status: 'pending'
    });
    res.status(201).json(incidentReport);
  } catch (error) {
    logger.error('Error creating incident report:', error);
    res.status(500).json({ message: 'Error creating incident report' });
  }
});

// Update an incident report
router.put('/:id', auth, checkRole(['admin', 'care_worker']), validate, async (req, res) => {
  try {
    const incidentReport = await IncidentReport.findByPk(req.params.id);
    if (!incidentReport) {
      return res.status(404).json({ message: 'Incident report not found' });
    }
    
    // Only allow admin to change status
    if (req.userRole !== 'admin') {
      delete req.body.status;
    }
    
    await incidentReport.update(req.body);
    res.json(incidentReport);
  } catch (error) {
    logger.error('Error updating incident report:', error);
    res.status(500).json({ message: 'Error updating incident report' });
  }
});

// Delete an incident report
router.delete('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const incidentReport = await IncidentReport.findByPk(req.params.id);
    if (!incidentReport) {
      return res.status(404).json({ message: 'Incident report not found' });
    }
    await incidentReport.destroy();
    res.json({ message: 'Incident report deleted successfully' });
  } catch (error) {
    logger.error('Error deleting incident report:', error);
    res.status(500).json({ message: 'Error deleting incident report' });
  }
});

module.exports = router;
