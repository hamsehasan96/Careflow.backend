const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const goalController = require('../controllers/goal.controller');

// Get all goals for a participant
router.get(
  '/participant/:participantId',
  // authMiddleware,
  goalController.getParticipantGoals
);

// Get goal by ID
router.get(
  '/:id',
  // authMiddleware,
  goalController.getGoalById
);

// Create new goal
router.post(
  '/',
  // authMiddleware,
  [
    check('participantId', 'Participant ID is required').not().isEmpty(),
    check('title', 'Goal title is required').not().isEmpty()
  ],
  goalController.createGoal
);

// Update goal
router.put(
  '/:id',
  // authMiddleware,
  goalController.updateGoal
);

// Delete goal
router.delete(
  '/:id',
  // authMiddleware,
  goalController.deleteGoal
);

module.exports = router;
