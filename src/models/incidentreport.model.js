const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const IncidentReport = sequelize.define('IncidentReport', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  incidentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  incidentTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  incidentType: {
    type: DataTypes.ENUM(
      'injury', 
      'medication_error', 
      'behavioral', 
      'property_damage', 
      'restrictive_practice',
      'complaint',
      'other'
    ),
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('minor', 'moderate', 'major', 'severe', 'critical'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  immediateActions: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  witnessNames: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  reportedToNDIS: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  reportedToPolice: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  reportedToFamily: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  followUpActions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  followUpDueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  followUpCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  attachments: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'under_review', 'closed'),
    defaultValue: 'draft'
  }
}, {
  timestamps: true
});

module.exports = IncidentReport;
