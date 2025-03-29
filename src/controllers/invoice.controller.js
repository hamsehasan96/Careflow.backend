const { validationResult } = require('express-validator');
const Invoice = require('../models/invoice.model');
const InvoiceLineItem = require('../models/invoicelineitem.model');
const Participant = require('../models/participant.model');
const User = require('../models/user.model');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const csv = require('fast-csv');

// Get all invoices
exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      include: [
        { model: Participant, as: 'participant', attributes: ['id', 'firstName', 'lastName', 'ndisNumber'] },
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] }
      ],
      order: [['invoiceDate', 'DESC']]
    });
    
    res.status(200).json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get invoice by ID
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        { model: Participant, as: 'participant', attributes: ['id', 'firstName', 'lastName', 'ndisNumber', 'address', 'suburb', 'state', 'postcode'] },
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] },
        { 
          model: InvoiceLineItem, 
          as: 'lineItems',
          include: [
            { model: User, as: 'staffMember', attributes: ['id', 'firstName', 'lastName'] }
          ]
        }
      ]
    });
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    res.status(200).json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get invoices for a participant
exports.getParticipantInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      where: { participantId: req.params.participantId },
      include: [
        { model: Participant, as: 'participant', attributes: ['id', 'firstName', 'lastName', 'ndisNumber'] },
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] }
      ],
      order: [['invoiceDate', 'DESC']]
    });
    
    res.status(200).json(invoices);
  } catch (error) {
    console.error('Error fetching participant invoices:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new invoice
exports.createInvoice = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const transaction = await sequelize.transaction();
  
  try {
    const { participantId, organizationId, invoiceDate, dueDate, notes, lineItems, createdBy } = req.body;
    
    // Generate invoice number
    const invoiceCount = await Invoice.count({
      where: { organizationId }
    });
    
    const invoiceNumber = `INV-${organizationId.substring(0, 4)}-${(invoiceCount + 1).toString().padStart(5, '0')}`;
    
    // Calculate totals
    let subtotal = 0;
    let gst = 0;
    
    lineItems.forEach(item => {
      subtotal += parseFloat(item.amount);
      gst += parseFloat(item.gstAmount);
    });
    
    const total = subtotal + gst;
    
    // Create invoice
    const newInvoice = await Invoice.create({
      invoiceNumber,
      participantId,
      organizationId,
      invoiceDate,
      dueDate,
      status: 'draft',
      subtotal,
      gst,
      total,
      notes,
      createdBy
    }, { transaction });
    
    // Create line items
    const lineItemsWithInvoiceId = lineItems.map(item => ({
      ...item,
      invoiceId: newInvoice.id
    }));
    
    await InvoiceLineItem.bulkCreate(lineItemsWithInvoiceId, { transaction });
    
    await transaction.commit();
    
    // Fetch the complete invoice with line items
    const invoice = await Invoice.findByPk(newInvoice.id, {
      include: [
        { model: Participant, as: 'participant', attributes: ['id', 'firstName', 'lastName', 'ndisNumber'] },
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] },
        { model: InvoiceLineItem, as: 'lineItems' }
      ]
    });
    
    res.status(201).json(invoice);
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating invoice:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update invoice
exports.updateInvoice = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    // Check if invoice is already sent or paid
    if (invoice.status !== 'draft') {
      return res.status(403).json({ message: 'Cannot update a sent or paid invoice' });
    }
    
    const { invoiceDate, dueDate, notes, lineItems } = req.body;
    
    // Calculate totals
    let subtotal = 0;
    let gst = 0;
    
    lineItems.forEach(item => {
      subtotal += parseFloat(item.amount);
      gst += parseFloat(item.gstAmount);
    });
    
    const total = subtotal + gst;
    
    // Update invoice
    await invoice.update({
      invoiceDate,
      dueDate,
      subtotal,
      gst,
      total,
      notes
    }, { transaction });
    
    // Delete existing line items
    await InvoiceLineItem.destroy({
      where: { invoiceId: invoice.id }
    }, { transaction });
    
    // Create new line items
    const lineItemsWithInvoiceId = lineItems.map(item => ({
      ...item,
      invoiceId: invoice.id
    }));
    
    await InvoiceLineItem.bulkCreate(lineItemsWithInvoiceId, { transaction });
    
    await transaction.commit();
    
    // Fetch the updated invoice with line items
    const updatedInvoice = await Invoice.findByPk(invoice.id, {
      include: [
        { model: Participant, as: 'participant', attributes: ['id', 'firstName', 'lastName', 'ndisNumber'] },
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] },
        { model: InvoiceLineItem, as: 'lineItems' }
      ]
    });
    
    res.status(200).json(updatedInvoice);
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating invoice:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send invoice
exports.sendInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    // Check if invoice is already sent or paid
    if (invoice.status !== 'draft') {
      return res.status(403).json({ message: 'Invoice has already been sent or processed' });
    }
    
    // Update invoice status
    await invoice.update({
      status: 'sent',
      sentDate: new Date()
    });
    
    // In a real implementation, this would send an email with the invoice PDF
    
    res.status(200).json(invoice);
  } catch (error) {
    console.error('Error sending invoice:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark invoice as paid
exports.markInvoiceAsPaid = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    // Check if invoice is already paid
    if (invoice.status === 'paid') {
      return res.status(403).json({ message: 'Invoice has already been paid' });
    }
    
    const { paymentMethod, paymentDate, paymentReference } = req.body;
    
    // Update invoice status
    await invoice.update({
      status: 'paid',
      paymentMethod,
      paymentDate,
      paymentReference
    });
    
    res.status(200).json(invoice);
  } catch (error) {
    console.error('Error marking invoice as paid:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Cancel invoice
exports.cancelInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    // Check if invoice is already paid
    if (invoice.status === 'paid') {
      return res.status(403).json({ message: 'Cannot cancel a paid invoice' });
    }
    
    // Update invoice status
    await invoice.update({
      status: 'cancelled'
    });
    
    res.status(200).json(invoice);
  } catch (error) {
    console.error('Error cancelling invoice:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Generate PDF invoice
exports.generateInvoicePdf = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        { model: Participant, as: 'participant', attributes: ['id', 'firstName', 'lastName', 'ndisNumber', 'address', 'suburb', 'state', 'postcode'] },
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] },
        { 
          model: InvoiceLineItem, 
          as: 'lineItems',
          include: [
            { model: User, as: 'staffMember', attributes: ['id', 'firstName', 'lastName'] }
          ]
        }
      ]
    });
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Add content to PDF
    // Header
    doc.fontSize(20).text('INVOICE', { align: 'center' });
    doc.moveDown();
    
    // Organization info
    doc.fontSize(12).text('CareFlow NDIS Services', { align: 'left' });
    doc.fontSize(10).text('123 Main Street, Perth WA 6000', { align: 'left' });
    doc.text('ABN: 12 345 678 901', { align: 'left' });
    doc.moveDown();
    
    // Invoice details
    doc.fontSize(12).text(`Invoice Number: ${invoice.invoiceNumber}`, { align: 'right' });
    doc.fontSize(10).text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, { align: 'right' });
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, { align: 'right' });
    doc.moveDown();
    
    // Participant details
    doc.fontSize(12).text('Bill To:', { align: 'left' });
    doc.fontSize(10).text(`${invoice.participant.firstName} ${invoice.participant.lastName}`, { align: 'left' });
    doc.text(`NDIS Number: ${invoice.participant.ndisNumber}`, { align: 'left' });
    if (invoice.participant.address) {
      doc.text(`${invoice.participant.address}`, { align: 'left' });
      doc.text(`${invoice.participant.suburb}, ${invoice.participant.state} ${invoice.participant.postcode}`, { align: 'left' });
    }
    doc.moveDown();
    
    // Line items
    doc.fontSize(12).text('Services:', { align: 'left' });
    doc.moveDown();
    
    // Table header
    const tableTop = doc.y;
    const itemX = 50;
    const descriptionX = 150;
    const dateX = 280;
    const quantityX = 350;
    const rateX = 400;
    const amountX = 480;
    
    doc.fontSize(10)
      .text('Item #', itemX, tableTop)
      .text('Description', descriptionX, tableTop)
      .text('Date', dateX, tableTop)
      .text('Qty', quantityX, tableTop)
      .text('Rate', rateX, tableTop)
      .text('Amount', amountX, tableTop);
    
    doc.moveDown();
    let tableY = doc.y;
    
    // Table rows
    invoice.lineItems.forEach(item => {
      doc.text(item.supportItemNumber, itemX, tableY)
        .text(item.supportItemName, descriptionX, tableY)
        .text(new Date(item.serviceDate).toLocaleDateString(), dateX, tableY)
        .text(item.quantity.toString(), quantityX, tableY)
        .text(`$${item.unitPrice.toFixed(2)}`, rateX, tableY)
        .text(`$${item.amount.toFixed(2)}`, amountX, tableY);
      
      tableY = doc.y + 15;
      doc.moveDown();
    });
    
    doc.moveDown();
    
    // Totals
    doc.text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, amountX - 80, tableY);
    doc.text(`GST: $${invoice.gst.toFixed(2)}`, amountX - 80, tableY + 15);
    doc.fontSize(12).text(`Total: $${invoice.total.toFixed(2)}`, amountX - 80, tableY + 35);
    
    doc.moveDown(2);
    
    // Notes
    if (invoice.notes) {
      doc.fontSize(10).text('Notes:', { align: 'left' });
      doc.text(invoice.notes, { align: 'left' });
    }
    
    // Payment details
    doc.moveDown();
    doc.fontSize(10).text('Payment Details:', { align: 'left' });
    doc.text('Account Name: CareFlow NDIS Services', { align: 'left' });
    doc.text('BSB: 123-456', { align: 'left' });
    doc.text('Account Number: 12345678', { align: 'left' });
    doc.text(`Reference: ${invoice.invoiceNumber}`, { align: 'left' });
    
    // Footer
    doc.fontSize(10).text('Thank you for your business!', 50, 700, { align: 'center' });
    
    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Export invoices to CSV
exports.exportInvoicesToCsv = async (req, res) => {
  try {
    const { startDate, endDate, participantId } = req.query;
    
    // Build query conditions
    const whereConditions = {};
    
    if (startDate && endDate) {
      whereConditions.invoiceDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    if (participantId) {
      whereConditions.participantId = participantId;
    }
    
    // Fetch invoices
    const invoices = await Invoice.findAll({
      where: whereConditions,
      include: [
        { model: Participant, as: 'participant', attributes: ['id', 'firstName', 'lastName', 'ndisNumber'] },
        { model: InvoiceLineItem, as: 'lineItems' }
      ],
      order: [['invoiceDate', 'DESC']]
    });
    
    // Prepare CSV data
    const csvData = [];
    
    // Add header row
    csvData.push([
      'Invoice Number',
      'Participant',
      'NDIS Number',
      'Invoice Date',
      'Due Date',
      'Status',
      'Support Item Number',
      'Support Item Name',
      'Service Date',
      'Quantity',
      'Unit Price',
      'GST',
      'Amount',
      'Claim Type',
      'Funding Category'
    ]);
    
    // Add data rows
    invoices.forEach(invoice => {
      invoice.lineItems.forEach(item => {
        csvData.push([
          invoice.invoiceNumber,
          `${invoice.participant.firstName} ${invoice.participant.lastName}`,
          invoice.participant.ndisNumber,
          new Date(invoice.invoiceDate).toLocaleDateString(),
          new Date(invoice.dueDate).toLocaleDateString(),
          invoice.status,
          item.supportItemNumber,
          item.supportItemName,
          new Date(item.serviceDate).toLocaleDateString(),
          item.quantity,
          item.unitPrice,
          item.gstAmount,
          item.amount,
          item.claimType,
          item.fundingCategory
        ]);
      });
    });
    
    // Set response headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=invoices.csv');
    
    // Write CSV to response
    const csvStream = csv.format({ headers: false });
    csvStream.pipe(res);
    
    csvData.forEach(row => {
      csvStream.write(row);
    });
    
    csvStream.end();
  } catch (error) {
    console.error('Error exporting invoices to CSV:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get NDIS support items
exports.getNdisSupportItems = async (req, res) => {
  try {
    // In a real implementation, this would fetch from a database of NDIS price guide items
    // For this example, we'll return a static list of common support items for WA
    const supportItems = [
      {
        supportItemNumber: '01_011_0107_1_1',
        supportItemName: 'Assistance With Self-Care Activities - Standard - Weekday Daytime',
        description: 'Assistance with self-care activities during weekday daytime hours',
        unitPrice: 57.10,
        claimType: 'core',
        fundingCategory: 'Assistance with Daily Life'
      },
      {
        supportItemNumber: '01_015_0107_1_1',
        supportItemName: 'Assistance With Self-Care Activities - Standard - Saturday',
        description: 'Assistance with self-care activities on Saturday',
        unitPrice: 80.10,
        claimType: 'core',
        fundingCategory: 'Assistance with Daily Life'
      },
      {
        supportItemNumber: '01_002_0107_1_1',
        supportItemName: 'Assistance With Self-Care Activities - Standard - Sunday',
        description: 'Assistance with self-care activities on Sunday',
        unitPrice: 103.11,
        claimType: 'core',
        fundingCategory: 'Assistance with Daily Life'
      },
      {
        supportItemNumber: '01_013_0107_1_1',
        supportItemName: 'Assistance With Self-Care Activities - Standard - Public Holiday',
        description: 'Assistance with self-care activities on Public Holiday',
        unitPrice: 126.11,
        claimType: 'core',
        fundingCategory: 'Assistance with Daily Life'
      },
      {
        supportItemNumber: '04_104_0125_6_1',
        supportItemName: 'Community Nursing Care For Continence Aid',
        description: 'Continence assessment, training and support by a nurse',
        unitPrice: 124.05,
        claimType: 'core',
        fundingCategory: 'Health and Wellbeing'
      },
      {
        supportItemNumber: '04_103_0125_6_1',
        supportItemName: 'Community Nursing Care For High Care Needs',
        description: 'Nursing care for high care needs in the community',
        unitPrice: 124.05,
        claimType: 'core',
        fundingCategory: 'Health and Wellbeing'
      },
      {
        supportItemNumber: '15_056_0128_1_3',
        supportItemName: 'Assistance With Decision Making, Daily Planning and Budgeting',
        description: 'Support with decision making, daily planning and budgeting',
        unitPrice: 65.09,
        claimType: 'capacity_building',
        fundingCategory: 'Improved Daily Living'
      },
      {
        supportItemNumber: '15_045_0128_1_3',
        supportItemName: 'Community Engagement Assistance',
        description: 'Support to engage in community, social and recreational activities',
        unitPrice: 65.09,
        claimType: 'capacity_building',
        fundingCategory: 'Increased Social and Community Participation'
      },
      {
        supportItemNumber: '15_035_0106_1_3',
        supportItemName: 'Individual Skill Development And Training',
        description: 'Individual training for skill development',
        unitPrice: 65.09,
        claimType: 'capacity_building',
        fundingCategory: 'Improved Daily Living'
      },
      {
        supportItemNumber: '15_038_0117_1_3',
        supportItemName: 'Training For Carers/Parents',
        description: 'Training for parents and carers',
        unitPrice: 65.09,
        claimType: 'capacity_building',
        fundingCategory: 'Improved Daily Living'
      },
      {
        supportItemNumber: '07_001_0106_8_3',
        supportItemName: 'Support Coordination Level 1: Support Connection',
        description: 'Assistance to strengthen participant's ability to connect with informal, mainstream and funded supports',
        unitPrice: 63.21,
        claimType: 'capacity_building',
        fundingCategory: 'Support Coordination'
      },
      {
        supportItemNumber: '07_002_0106_8_3',
        supportItemName: 'Support Coordination Level 2: Coordination Of Supports',
        description: 'Assistance to strengthen participant's ability to coordinate their supports and participate in the community',
        unitPrice: 100.14,
        claimType: 'capacity_building',
        fundingCategory: 'Support Coordination'
      },
      {
        supportItemNumber: '07_004_0132_8_3',
        supportItemName: 'Support Coordination Level 3: Specialist Support Coordination',
        description: 'Specialist support coordination for high-level or complex needs',
        unitPrice: 190.54,
        claimType: 'capacity_building',
        fundingCategory: 'Support Coordination'
      },
      {
        supportItemNumber: '08_005_0106_2_3',
        supportItemName: 'Assistance With Accommodation And Tenancy Obligations',
        description: 'Support to maintain tenancy or accommodation',
        unitPrice: 65.09,
        claimType: 'capacity_building',
        fundingCategory: 'Improved Living Arrangements'
      },
      {
        supportItemNumber: '09_006_0106_6_3',
        supportItemName: 'Life Transition Planning Incl. Mentoring, Peer-Support And Individual Skill Develop',
        description: 'Support with life transitions',
        unitPrice: 65.09,
        claimType: 'capacity_building',
        fundingCategory: 'Finding and Keeping a Job'
      }
    ];
    
    res.status(200).json(supportItems);
  } catch (error) {
    console.error('Error fetching NDIS support items:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
