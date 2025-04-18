const path = require('path');
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { 
  getParticipantDocuments, 
  getDocumentById, 
  upload, 
  uploadDocument, 
  downloadDocument, 
  deleteDocument 
} = require(path.join(__dirname, '..', 'controllers', 'document.controller'));

// Get all documents for a participant
router.get(
  '/participant/:participantId',
  // authMiddleware,
  getParticipantDocuments
);

// Get document by ID
router.get(
  '/:id',
  // authMiddleware,
  getDocumentById
);

// Upload new document
router.post(
  '/upload',
  // authMiddleware,
  [
    check('participantId', 'Participant ID is required').not().isEmpty(),
    check('documentType', 'Document type is required').not().isEmpty()
  ],
  upload,
  uploadDocument
);

// Download document
router.get(
  '/download/:id',
  // authMiddleware,
  downloadDocument
);

// Delete document
router.delete(
  '/:id',
  // authMiddleware,
  deleteDocument
);

module.exports = router;
