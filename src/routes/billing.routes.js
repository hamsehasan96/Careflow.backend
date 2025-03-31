const express = require('express');
const router = express.Router();
const { Invoice, InvoiceLineItem } = require('../models');
const { auth, checkRole } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const logger = require('../config/logger');

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