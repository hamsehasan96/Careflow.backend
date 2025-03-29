const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  participantId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Participants',
      key: 'id'
    }
  },
  organizationId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  invoiceDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled'),
    defaultValue: 'draft'
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  gst: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  notes: {
    type: DataTypes.TEXT
  },
  paymentMethod: {
    type: DataTypes.STRING
  },
  paymentDate: {
    type: DataTypes.DATE
  },
  paymentReference: {
    type: DataTypes.STRING
  },
  claimReference: {
    type: DataTypes.STRING
  },
  sentDate: {
    type: DataTypes.DATE
  },
  pdfUrl: {
    type: DataTypes.STRING
  },
  createdBy: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  timestamps: true
});

module.exports = Invoice;
