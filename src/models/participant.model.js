const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Participant = sequelize.define('Participant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  suburb: {
    type: DataTypes.STRING,
    allowNull: true
  },
  state: {
    type: DataTypes.STRING,
    defaultValue: 'WA',
    allowNull: true
  },
  postcode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  ndisNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  planStartDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  planEndDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  planManagedBy: {
    type: DataTypes.ENUM('self', 'plan_manager', 'ndia'),
    allowNull: true
  },
  preferredLanguage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  interpreterRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  culturalBackground: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emergencyContactName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emergencyContactPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emergencyContactRelationship: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'pending'),
    defaultValue: 'active'
  }
}, {
  timestamps: true
});

module.exports = Participant;
