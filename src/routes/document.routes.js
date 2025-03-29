const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const documentController = require('../controllers/document.controller');

// Get all documents for a participant
router.get(
  '/participant/:participantId',
  // authMiddleware,
  documentController.getParticipantDocuments
);

// Get document by ID
router.get(
  '/:id',
  // authMiddleware,
  documentController.getDocumentById
);

// Upload new document
router.post(
  '/upload',
  // authMiddleware,
  [
    check('participantId', 'Participant ID is required').not().isEmpty(),
    check('documentType', 'Document type is required').not().isEmpty()
  ],
  documentController.upload,
  documentController.uploadDocument
);

// Download document
router.get(
  '/download/:id',
  // authMiddleware,
  documentController.downloadDocument
);

// Delete document
router.delete(
  '/:id',
  // authMiddleware,
  documentController.deleteDocument
);

module.exports = router;
