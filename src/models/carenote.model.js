const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CareNote = sequelize.define('CareNote', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  noteType: {
    type: DataTypes.ENUM('shift_note', 'progress_note', 'incident_report', 'restrictive_practice'),
    allowNull: false,
    defaultValue: 'shift_note'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: true
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  moodRating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  goalProgress: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  followUpRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  followUpDetails: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  attachments: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  signedBy: {
    type: DataTypes.UUID,
    allowNull: true
  },
  signatureTimestamp: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = CareNote;
