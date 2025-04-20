module.exports = (sequelize, DataTypes) => {
  const CareNote = sequelize.define('CareNote', {
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
    staffId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('daily', 'incident', 'medication', 'behavior', 'other'),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    mood: {
      type: DataTypes.ENUM('happy', 'neutral', 'sad', 'angry', 'anxious'),
      allowNull: true
    },
    activities: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    medications: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    vitalSigns: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    concerns: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    followUpRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    followUpNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true
  });

  // Define associations
  CareNote.associate = (models) => {
    CareNote.belongsTo(models.Participant, {
      foreignKey: 'participantId',
      as: 'participant'
    });
    CareNote.belongsTo(models.User, {
      foreignKey: 'staffId',
      as: 'staff'
    });
  };

  return CareNote;
};
