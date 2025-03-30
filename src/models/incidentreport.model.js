module.exports = (sequelize, DataTypes) => {
  const IncidentReport = sequelize.define('IncidentReport', {
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
    reportedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    incidentType: {
      type: DataTypes.ENUM('fall', 'injury', 'behavior', 'medication', 'other'),
      allowNull: false
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    immediateActions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    witnesses: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    medicalAttention: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    medicalDetails: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    followUpRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    followUpActions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('draft', 'submitted', 'reviewed', 'closed'),
      defaultValue: 'draft'
    },
    attachments: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  }, {
    timestamps: true
  });

  // Define associations
  IncidentReport.associate = (models) => {
    IncidentReport.belongsTo(models.Participant, {
      foreignKey: 'participantId',
      as: 'participant'
    });
    IncidentReport.belongsTo(models.User, {
      foreignKey: 'reportedBy',
      as: 'reporter'
    });
  };

  return IncidentReport;
};
