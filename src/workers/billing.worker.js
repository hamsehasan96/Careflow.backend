const { billing } = require('../config/queue');
const logger = require('../config/logger');
const { sequelize } = require('../config/database');
const { Participant, CareService, Invoice, Payment } = require('../models');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Process billing jobs
billing.process(async (job) => {
  const { type, data } = job.data;

  try {
    switch (type) {
      case 'GENERATE_INVOICE':
        await generateInvoice(data);
        break;
      case 'PROCESS_PAYMENT':
        await processPayment(data);
        break;
      case 'RECONCILE_NDIS_PLAN':
        await reconcileNDISPlan(data);
        break;
      case 'GENERATE_STATEMENT':
        await generateStatement(data);
        break;
      case 'CHECK_OVERDUE_PAYMENTS':
        await checkOverduePayments();
        break;
      default:
        throw new Error(`Unknown billing job type: ${type}`);
    }

    logger.info(`Billing job ${type} completed successfully`);
    return { success: true };
  } catch (error) {
    logger.error(`Billing job ${type} failed:`, error);
    throw error;
  }
});

// Generate invoice
async function generateInvoice(data) {
  const { participantId, services, period } = data;

  try {
    const participant = await Participant.findByPk(participantId);
    if (!participant) {
      throw new Error('Participant not found');
    }

    // Calculate total amount
    const totalAmount = await calculateServiceCosts(services);

    // Create invoice
    const invoice = await Invoice.create({
      participantId,
      amount: totalAmount,
      status: 'pending',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      period: {
        start: period.start,
        end: period.end
      }
    });

    // Generate PDF invoice
    const pdfPath = await generateInvoicePDF(invoice, services);

    // Update invoice with PDF path
    await invoice.update({ documentPath: pdfPath });

    // Send invoice notification
    await sendInvoiceNotification(invoice);

    return invoice;
  } catch (error) {
    logger.error('Failed to generate invoice:', error);
    throw error;
  }
}

// Process payment
async function processPayment(data) {
  const { invoiceId, amount, paymentMethod, reference } = data;

  try {
    const invoice = await Invoice.findByPk(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Create payment record
    const payment = await Payment.create({
      invoiceId,
      amount,
      paymentMethod,
      reference,
      status: 'completed'
    });

    // Update invoice status
    await invoice.update({
      status: 'paid',
      paidAt: new Date()
    });

    // Send payment confirmation
    await sendPaymentConfirmation(payment);

    return payment;
  } catch (error) {
    logger.error('Failed to process payment:', error);
    throw error;
  }
}

// Reconcile NDIS plan
async function reconcileNDISPlan(data) {
  const { participantId, period } = data;

  try {
    const participant = await Participant.findByPk(participantId);
    if (!participant) {
      throw new Error('Participant not found');
    }

    // Get all services for the period
    const services = await CareService.findAll({
      where: {
        participantId,
        date: {
          [sequelize.Op.between]: [period.start, period.end]
        }
      }
    });

    // Calculate total spent
    const totalSpent = await calculateServiceCosts(services);

    // Check against plan budget
    const remainingBudget = participant.planBudget - totalSpent;

    // Generate reconciliation report
    const report = await generateReconciliationReport(participant, services, remainingBudget);

    // Send reconciliation notification
    await sendReconciliationNotification(participant, report);

    return report;
  } catch (error) {
    logger.error('Failed to reconcile NDIS plan:', error);
    throw error;
  }
}

// Generate statement
async function generateStatement(data) {
  const { participantId, period } = data;

  try {
    const participant = await Participant.findByPk(participantId);
    if (!participant) {
      throw new Error('Participant not found');
    }

    // Get all transactions for the period
    const transactions = await getTransactions(participantId, period);

    // Generate PDF statement
    const pdfPath = await generateStatementPDF(participant, transactions, period);

    // Send statement notification
    await sendStatementNotification(participant, pdfPath);

    return pdfPath;
  } catch (error) {
    logger.error('Failed to generate statement:', error);
    throw error;
  }
}

// Check overdue payments
async function checkOverduePayments() {
  const now = new Date();

  try {
    const overdueInvoices = await Invoice.findAll({
      where: {
        status: 'pending',
        dueDate: {
          [sequelize.Op.lt]: now
        }
      },
      include: [{ model: Participant }]
    });

    // Send overdue payment notifications
    for (const invoice of overdueInvoices) {
      await sendOverduePaymentNotification(invoice);
    }

    return overdueInvoices;
  } catch (error) {
    logger.error('Failed to check overdue payments:', error);
    throw error;
  }
}

// Helper functions
async function calculateServiceCosts(services) {
  return services.reduce((total, service) => {
    return total + (service.rate * service.duration);
  }, 0);
}

async function generateInvoicePDF(invoice, services) {
  const doc = new PDFDocument();
  const fileName = `invoice-${invoice.id}-${Date.now()}.pdf`;
  const filePath = path.join(process.env.UPLOAD_DIR, fileName);

  doc.pipe(fs.createWriteStream(filePath));

  // Add invoice header
  doc.fontSize(20).text('Invoice', { align: 'center' });
  doc.moveDown();

  // Add invoice details
  doc.fontSize(12).text(`Invoice Number: ${invoice.id}`);
  doc.text(`Date: ${new Date().toLocaleDateString()}`);
  doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`);
  doc.moveDown();

  // Add services table
  doc.fontSize(14).text('Services');
  doc.fontSize(12);
  services.forEach(service => {
    doc.text(`${service.description} - ${service.duration} hours @ $${service.rate}/hour`);
  });
  doc.moveDown();

  // Add total
  doc.fontSize(14).text(`Total Amount: $${invoice.amount}`);

  doc.end();
  return filePath;
}

async function generateReconciliationReport(participant, services, remainingBudget) {
  const doc = new PDFDocument();
  const fileName = `reconciliation-${participant.id}-${Date.now()}.pdf`;
  const filePath = path.join(process.env.UPLOAD_DIR, fileName);

  doc.pipe(fs.createWriteStream(filePath));

  // Add report header
  doc.fontSize(20).text('NDIS Plan Reconciliation', { align: 'center' });
  doc.moveDown();

  // Add participant details
  doc.fontSize(12).text(`Participant: ${participant.name}`);
  doc.text(`NDIS Number: ${participant.ndisNumber}`);
  doc.moveDown();

  // Add budget summary
  doc.fontSize(14).text('Budget Summary');
  doc.fontSize(12);
  doc.text(`Total Budget: $${participant.planBudget}`);
  doc.text(`Total Spent: $${participant.planBudget - remainingBudget}`);
  doc.text(`Remaining Budget: $${remainingBudget}`);
  doc.moveDown();

  // Add services summary
  doc.fontSize(14).text('Services Summary');
  doc.fontSize(12);
  services.forEach(service => {
    doc.text(`${service.description}: $${service.rate * service.duration}`);
  });

  doc.end();
  return filePath;
}

async function generateStatementPDF(participant, transactions, period) {
  const doc = new PDFDocument();
  const fileName = `statement-${participant.id}-${Date.now()}.pdf`;
  const filePath = path.join(process.env.UPLOAD_DIR, fileName);

  doc.pipe(fs.createWriteStream(filePath));

  // Add statement header
  doc.fontSize(20).text('Account Statement', { align: 'center' });
  doc.moveDown();

  // Add period
  doc.fontSize(12).text(`Period: ${new Date(period.start).toLocaleDateString()} - ${new Date(period.end).toLocaleDateString()}`);
  doc.moveDown();

  // Add transactions
  doc.fontSize(14).text('Transactions');
  doc.fontSize(12);
  transactions.forEach(transaction => {
    doc.text(`${new Date(transaction.date).toLocaleDateString()} - ${transaction.description}: $${transaction.amount}`);
  });

  doc.end();
  return filePath;
}

async function getTransactions(participantId, period) {
  // Implement transaction retrieval logic
  return [];
}

async function sendInvoiceNotification(invoice) {
  // Implement invoice notification logic
}

async function sendPaymentConfirmation(payment) {
  // Implement payment confirmation logic
}

async function sendReconciliationNotification(participant, report) {
  // Implement reconciliation notification logic
}

async function sendStatementNotification(participant, statementPath) {
  // Implement statement notification logic
}

async function sendOverduePaymentNotification(invoice) {
  // Implement overdue payment notification logic
}

// Handle failed jobs
billing.on('failed', (job, error) => {
  logger.error(`Billing job ${job.id} failed:`, error);
});

// Handle completed jobs
billing.on('completed', (job) => {
  logger.info(`Billing job ${job.id} completed successfully`);
});

module.exports = billing; 