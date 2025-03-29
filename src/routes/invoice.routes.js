const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const invoiceController = require('../controllers/invoice.controller');

// Get all invoices
router.get(
  '/',
  // authMiddleware,
  invoiceController.getAllInvoices
);

// Get invoice by ID
router.get(
  '/:id',
  // authMiddleware,
  invoiceController.getInvoiceById
);

// Get invoices for a participant
router.get(
  '/participant/:participantId',
  // authMiddleware,
  invoiceController.getParticipantInvoices
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
  invoiceController.createInvoice
);

// Update invoice
router.put(
  '/:id',
  // authMiddleware,
  invoiceController.updateInvoice
);

// Send invoice
router.put(
  '/:id/send',
  // authMiddleware,
  invoiceController.sendInvoice
);

// Mark invoice as paid
router.put(
  '/:id/paid',
  // authMiddleware,
  invoiceController.markInvoiceAsPaid
);

// Cancel invoice
router.put(
  '/:id/cancel',
  // authMiddleware,
  invoiceController.cancelInvoice
);

// Generate PDF invoice
router.get(
  '/:id/pdf',
  // authMiddleware,
  invoiceController.generateInvoicePdf
);

// Export invoices to CSV
router.get(
  '/export/csv',
  // authMiddleware,
  invoiceController.exportInvoicesToCsv
);

// Get NDIS support items
router.get(
  '/ndis/support-items',
  // authMiddleware,
  invoiceController.getNdisSupportItems
);

module.exports = router;
