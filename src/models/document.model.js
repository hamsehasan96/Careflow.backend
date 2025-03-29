const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  participantId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Participants',
      key: 'id'
    }
  },
  documentType: {
    type: DataTypes.ENUM('ndis_plan', 'medical', 'consent', 'assessment', 'other'),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fileType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  uploadedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  timestamps: true
});

module.exports = Document;
