const path = require('path');
const express = require('express');
const router = express.Router();
const { Report } = require(path.join(__dirname, '..', 'models'));
const { auth, checkRole } = require(path.join(__dirname, '..', 'middleware', 'auth.middleware'));
const { validate } = require(path.join(__dirname, '..', 'middleware', 'validate.middleware'));
const logger = require(path.join(__dirname, '..', 'config', 'logger'));

// Get all reports
router.get('/', auth, checkRole(['admin', 'manager']), async (req, res) => {
  try {
    const reports = await Report.findAll({
      include: ['participant', 'createdBy'],
      order: [['createdAt', 'DESC']]
    });
    res.json(reports);
  } catch (error) {
    logger.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Error fetching reports' });
  }
});

// Get a single report
router.get('/:id', auth, checkRole(['admin', 'manager']), async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id, {
      include: ['participant', 'createdBy']
    });
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    logger.error('Error fetching report:', error);
    res.status(500).json({ message: 'Error fetching report' });
  }
});

// Create a new report
router.post('/', auth, checkRole(['admin', 'manager']), validate, async (req, res) => {
  try {
    const report = await Report.create({
      ...req.body,
      createdById: req.user.id,
      status: 'draft'
    });
    res.status(201).json(report);
  } catch (error) {
    logger.error('Error creating report:', error);
    res.status(500).json({ message: 'Error creating report' });
  }
});

// Update a report
router.put('/:id', auth, checkRole(['admin', 'manager']), validate, async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    await report.update(req.body);
    res.json(report);
  } catch (error) {
    logger.error('Error updating report:', error);
    res.status(500).json({ message: 'Error updating report' });
  }
});

// Delete a report
router.delete('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    await report.destroy();
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    logger.error('Error deleting report:', error);
    res.status(500).json({ message: 'Error deleting report' });
  }
});

// Submit a report for review
router.post('/:id/submit', auth, checkRole(['admin', 'manager']), async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    await report.update({ status: 'submitted' });
    res.json(report);
  } catch (error) {
    logger.error('Error submitting report:', error);
    res.status(500).json({ message: 'Error submitting report' });
  }
});

// Approve a report
router.post('/:id/approve', auth, checkRole(['admin']), async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    await report.update({ status: 'approved' });
    res.json(report);
  } catch (error) {
    logger.error('Error approving report:', error);
    res.status(500).json({ message: 'Error approving report' });
  }
});

// Reject a report
router.post('/:id/reject', auth, checkRole(['admin']), async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    await report.update({ status: 'rejected' });
    res.json(report);
  } catch (error) {
    logger.error('Error rejecting report:', error);
    res.status(500).json({ message: 'Error rejecting report' });
  }
});

module.exports = router; 