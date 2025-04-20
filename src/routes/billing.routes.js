const path = require('path');
const express = require('express');
const router = express.Router();
const { Invoice, InvoiceLineItem } = require(path.join(__dirname, '..', 'models'));
const { auth, checkRole } = require(path.join(__dirname, '..', 'middleware', 'auth.middleware'));
const { validate } = require(path.join(__dirname, '..', 'middleware', 'validate.middleware'));
const logger = require(path.join(__dirname, '..', 'config', 'logger'));
const { Parser } = require('json2csv');
const { authenticate, hasPermission } = require(path.join(__dirname, '..', 'middleware', 'rbac.middleware'));
const { handleValidationErrors } = require(path.join(__dirname, '..', 'middleware', 'validation.middleware'));
const { sanitizeBody } = require(path.join(__dirname, '..', 'middleware', 'sanitization.middleware'));
const { Billing, Participant, CareWorker } = require(path.join(__dirname, '..', 'models'));

// Get all invoices
router.get('/', auth, checkRole(['admin', 'manager']), async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      include: ['participant', 'lineItems'],
      order: [['createdAt', 'DESC']]
    });
    res.json(invoices);
  } catch (error) {
    logger.error('Error fetching invoices:', error);
    res.status(500).json({ message: 'Error fetching invoices' });
  }
});

// Get a single invoice
router.get('/:id', auth, checkRole(['admin', 'manager']), async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: ['participant', 'lineItems']
    });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    logger.error('Error fetching invoice:', error);
    res.status(500).json({ message: 'Error fetching invoice' });
  }
});

// Get invoices for a participant
router.get('/participant/:participantId', auth, checkRole(['admin', 'manager']), async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      where: { participantId: req.params.participantId },
      include: ['participant', 'lineItems'],
      order: [['createdAt', 'DESC']]
    });
    res.json(invoices);
  } catch (error) {
    logger.error('Error fetching participant invoices:', error);
    res.status(500).json({ message: 'Error fetching participant invoices' });
  }
});

// Create a new invoice
router.post('/', auth, checkRole(['admin', 'manager']), validate, async (req, res) => {
  try {
    const invoice = await Invoice.create({
      ...req.body,
      status: 'pending'
    });
    res.status(201).json(invoice);
  } catch (error) {
    logger.error('Error creating invoice:', error);
    res.status(500).json({ message: 'Error creating invoice' });
  }
});

// Update an invoice
router.put('/:id', auth, checkRole(['admin', 'manager']), validate, async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    await invoice.update(req.body);
    res.json(invoice);
  } catch (error) {
    logger.error('Error updating invoice:', error);
    res.status(500).json({ message: 'Error updating invoice' });
  }
});

// Delete an invoice
router.delete('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    await invoice.destroy();
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    logger.error('Error deleting invoice:', error);
    res.status(500).json({ message: 'Error deleting invoice' });
  }
});

// Send invoice
router.put('/:id/send', auth, checkRole(['admin', 'manager']), async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    await invoice.update({ status: 'sent' });
    res.json(invoice);
  } catch (error) {
    logger.error('Error sending invoice:', error);
    res.status(500).json({ message: 'Error sending invoice' });
  }
});

// Mark invoice as paid
router.put('/:id/paid', auth, checkRole(['admin', 'manager']), async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    await invoice.update({ status: 'paid' });
    res.json(invoice);
  } catch (error) {
    logger.error('Error marking invoice as paid:', error);
    res.status(500).json({ message: 'Error marking invoice as paid' });
  }
});

// Cancel invoice
router.put('/:id/cancel', auth, checkRole(['admin', 'manager']), async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    await invoice.update({ status: 'cancelled' });
    res.json(invoice);
  } catch (error) {
    logger.error('Error cancelling invoice:', error);
    res.status(500).json({ message: 'Error cancelling invoice' });
  }
});

// Generate PDF invoice
router.get('/:id/pdf', auth, checkRole(['admin', 'manager']), async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: ['participant', 'lineItems']
    });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    // TODO: Implement PDF generation
    res.status(501).json({ message: 'PDF generation not implemented yet' });
  } catch (error) {
    logger.error('Error generating PDF invoice:', error);
    res.status(500).json({ message: 'Error generating PDF invoice' });
  }
});

// Export invoices to CSV
router.get('/export/csv', auth, checkRole(['admin']), async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      include: ['participant', 'lineItems'],
      order: [['createdAt', 'DESC']]
    });
    const parser = new Parser();
    const csv = parser.parse(invoices);
    res.header('Content-Type', 'text/csv');
    res.attachment('invoices.csv');
    res.send(csv);
  } catch (error) {
    logger.error('Error exporting invoices to CSV:', error);
    res.status(500).json({ message: 'Error exporting invoices to CSV' });
  }
});

// Get NDIS support items
router.get('/ndis/support-items', auth, checkRole(['admin', 'manager']), async (req, res) => {
  try {
    // TODO: Implement NDIS support items retrieval
    res.status(501).json({ message: 'NDIS support items retrieval not implemented yet' });
  } catch (error) {
    logger.error('Error fetching NDIS support items:', error);
    res.status(500).json({ message: 'Error fetching NDIS support items' });
  }
});

// Add line item to invoice
router.post('/:id/line-items', auth, checkRole(['admin', 'manager']), validate, async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    const lineItem = await InvoiceLineItem.create({
      ...req.body,
      invoiceId: invoice.id
    });
    res.status(201).json(lineItem);
  } catch (error) {
    logger.error('Error adding line item:', error);
    res.status(500).json({ message: 'Error adding line item' });
  }
});

// Update line item
router.put('/:id/line-items/:lineItemId', auth, checkRole(['admin', 'manager']), validate, async (req, res) => {
  try {
    const lineItem = await InvoiceLineItem.findByPk(req.params.lineItemId);
    if (!lineItem) {
      return res.status(404).json({ message: 'Line item not found' });
    }
    await lineItem.update(req.body);
    res.json(lineItem);
  } catch (error) {
    logger.error('Error updating line item:', error);
    res.status(500).json({ message: 'Error updating line item' });
  }
});

// Delete line item
router.delete('/:id/line-items/:lineItemId', auth, checkRole(['admin', 'manager']), async (req, res) => {
  try {
    const lineItem = await InvoiceLineItem.findByPk(req.params.lineItemId);
    if (!lineItem) {
      return res.status(404).json({ message: 'Line item not found' });
    }
    await lineItem.destroy();
    res.json({ message: 'Line item deleted successfully' });
  } catch (error) {
    logger.error('Error deleting line item:', error);
    res.status(500).json({ message: 'Error deleting line item' });
  }
});

module.exports = router; 