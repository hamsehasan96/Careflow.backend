const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { 
  getAllCareNotes, 
  getParticipantCareNotes, 
  getAuthorCareNotes, 
  getCareNoteById, 
  createCareNote, 
  updateCareNote, 
  signCareNote, 
  deleteCareNote 
} = require('../controllers/carenote.controller');

// Get all care notes
router.get(
  '/',
  // authMiddleware,
  getAllCareNotes
);

// Get care notes for a specific participant
router.get(
  '/participant/:participantId',
  // authMiddleware,
  getParticipantCareNotes
);

// Get care notes by author
router.get(
  '/author/:authorId',
  // authMiddleware,
  getAuthorCareNotes
);

// Get care note by ID
router.get(
  '/:id',
  // authMiddleware,
  getCareNoteById
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
  createCareNote
);

// Update care note
router.put(
  '/:id',
  // authMiddleware,
  updateCareNote
);

// Sign care note
router.put(
  '/:id/sign',
  // authMiddleware,
  signCareNote
);

// Delete care note
router.delete(
  '/:id',
  // authMiddleware,
  deleteCareNote
);

module.exports = router;
