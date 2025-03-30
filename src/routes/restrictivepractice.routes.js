const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { 
  getAllRestrictivePractices,
  getParticipantRestrictivePractices,
  getRestrictivePracticeById,
  createRestrictivePractice,
  updateRestrictivePractice,
  deleteRestrictivePractice
} = require('../controllers/restrictivepractice.controller');

// Get all restrictive practices
router.get(
  '/',
  // authMiddleware,
  getAllRestrictivePractices
);

// Get restrictive practices for a specific participant
router.get(
  '/participant/:participantId',
  // authMiddleware,
  getParticipantRestrictivePractices
);

// Get restrictive practice by ID
router.get(
  '/:id',
  // authMiddleware,
  getRestrictivePracticeById
);

// Create new restrictive practice
router.post(
  '/',
  // authMiddleware,
  [
    check('participantId', 'Participant ID is required').not().isEmpty(),
    check('authorizedById', 'Authorized by ID is required').not().isEmpty(),
    check('implementedById', 'Implemented by ID is required').not().isEmpty(),
    check('practiceType', 'Practice type is required').not().isEmpty(),
    check('startDate', 'Start date is required').not().isEmpty(),
    check('startTime', 'Start time is required').not().isEmpty(),
    check('endTime', 'End time is required').not().isEmpty(),
    check('location', 'Location is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('reason', 'Reason is required').not().isEmpty(),
    check('alternativesTriedBefore', 'Alternatives tried before is required').not().isEmpty()
  ],
  createRestrictivePractice
);

// Update restrictive practice
router.put(
  '/:id',
  // authMiddleware,
  updateRestrictivePractice
);

// Submit restrictive practice report
router.put(
  '/:id/submit',
  // authMiddleware,
  restrictivePracticeController.submitRestrictivePractice
);

// Delete restrictive practice
router.delete(
  '/:id',
  // authMiddleware,
  deleteRestrictivePractice
);

module.exports = router;
