const path = require('path');
const express = require('express');
const router = express.Router();
const { AnalyticsService } = require(path.join(__dirname, '..', 'services', 'analytics.service'));

const analyticsService = new AnalyticsService();

// Get dashboard summary statistics
router.get('/dashboard-summary', async (req, res) => {
  try {
    const summary = await analyticsService.getDashboardSummary();
    res.json(summary);
  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    res.status(500).json({ error: 'Failed to get dashboard summary' });
  }
});

// Get participant statistics
router.get('/participant-stats', async (req, res) => {
  try {
    const stats = await analyticsService.getParticipantStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting participant stats:', error);
    res.status(500).json({ error: 'Failed to get participant statistics' });
  }
});

// Get appointment statistics
router.get('/appointment-stats', async (req, res) => {
  try {
    const stats = await analyticsService.getAppointmentStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting appointment stats:', error);
    res.status(500).json({ error: 'Failed to get appointment statistics' });
  }
});

// Get staff statistics
router.get('/staff-stats', async (req, res) => {
  try {
    const stats = await analyticsService.getStaffStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting staff stats:', error);
    res.status(500).json({ error: 'Failed to get staff statistics' });
  }
});

module.exports = router;
