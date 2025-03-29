const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { 
  getAllInvoices, 
  getInvoiceById, 
  getParticipantInvoices, 
  createInvoice, 
  updateInvoice, 
  sendInvoice, 
  markInvoiceAsPaid, 
  cancelInvoice, 
  generateInvoicePdf, 
  exportInvoicesToCsv, 
  getNdisSupportItems 
} = require('../controllers/invoice.controller');

// Get all invoices
router.get(
  '/',
  // authMiddleware,
  getAllInvoices
);

// Get invoice by ID
router.get(
  '/:id',
  // authMiddleware,
  getInvoiceById
);

// Get invoices for a participant
router.get(
  '/participant/:participantId',
  // authMiddleware,
  getParticipantInvoices
);

// Create new invoice
router.post(
  '/',
  // authMiddleware,
  [
    check('participantId', 'Participant ID is required').not().isEmpty(),
    check('organizationId', 'Organization ID is required').not().isEmpty(),
    check('invoiceDate', 'Invoice date is required').not().isEmpty(),
    check('dueDate', 'Due date is required').not().isEmpty(),
    check('lineItems', 'Line items are required').isArray().not().isEmpty()
  ],
  createInvoice
);

// Update invoice
router.put(
  '/:id',
  // authMiddleware,
  updateInvoice
);

// Send invoice
router.put(
  '/:id/send',
  // authMiddleware,
  sendInvoice
);

// Mark invoice as paid
router.put(
  '/:id/paid',
  // authMiddleware,
  markInvoiceAsPaid
);

// Cancel invoice
router.put(
  '/:id/cancel',
  // authMiddleware,
  cancelInvoice
);

// Generate PDF invoice
router.get(
  '/:id/pdf',
  // authMiddleware,
  generateInvoicePdf
);

// Export invoices to CSV
router.get(
  '/export/csv',
  // authMiddleware,
  exportInvoicesToCsv
);

// Get NDIS support items
router.get(
  '/ndis/support-items',
  // authMiddleware,
  getNdisSupportItems
);

module.exports = router;
