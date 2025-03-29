const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Goal = sequelize.define('Goal', {
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
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('not-started', 'in-progress', 'completed'),
    defaultValue: 'not-started'
  },
  targetDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  completionDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Goal;
