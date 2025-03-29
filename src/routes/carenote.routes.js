const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const careNoteController = require('../controllers/carenote.controller');

// Get all care notes
router.get(
  '/',
  // authMiddleware,
  careNoteController.getAllCareNotes
);

// Get care notes for a specific participant
router.get(
  '/participant/:participantId',
  // authMiddleware,
  careNoteController.getParticipantCareNotes
);

// Get care notes by author
router.get(
  '/author/:authorId',
  // authMiddleware,
  careNoteController.getAuthorCareNotes
);

// Get care note by ID
router.get(
  '/:id',
  // authMiddleware,
  careNoteController.getCareNoteById
);

// Create new care note
router.post(
  '/',
  // authMiddleware,
  [
    check('noteType', 'Note type is required').not().isEmpty(),
    check('content', 'Content is required').not().isEmpty(),
    check('date', 'Date is required').not().isEmpty(),
    check('participantId', 'Participant ID is required').not().isEmpty()
  ],
  careNoteController.createCareNote
);

// Update care note
router.put(
  '/:id',
  // authMiddleware,
  careNoteController.updateCareNote
);

// Sign care note
router.put(
  '/:id/sign',
  // authMiddleware,
  careNoteController.signCareNote
);

// Delete care note
router.delete(
  '/:id',
  // authMiddleware,
  careNoteController.deleteCareNote
);

module.exports = router;
