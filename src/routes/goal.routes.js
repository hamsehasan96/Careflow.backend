const path = require('path');
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { 
  getParticipantGoals, 
  getGoalById, 
  createGoal, 
  updateGoal, 
  deleteGoal 
} = require(path.join(__dirname, '..', 'controllers', 'goal.controller'));

// Get all goals for a participant
router.get(
  '/participant/:participantId',
  // authMiddleware,
  getParticipantGoals
);

// Get goal by ID
router.get(
  '/:id',
  // authMiddleware,
  getGoalById
);

// Create new goal
router.post(
  '/',
  // authMiddleware,
  [
    check('participantId', 'Participant ID is required').not().isEmpty(),
    check('title', 'Goal title is required').not().isEmpty()
  ],
  createGoal
);

// Update goal
router.put(
  '/:id',
  // authMiddleware,
  updateGoal
);

// Delete goal
router.delete(
  '/:id',
  // authMiddleware,
  deleteGoal
);

module.exports = router;
