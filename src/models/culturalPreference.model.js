module.exports = (sequelize, DataTypes) => {
  const CulturalPreference = sequelize.define('CulturalPreference', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    participantId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    religion: {
      type: DataTypes.STRING,
      allowNull: true
    },
    dietaryRestrictions: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    culturalPractices: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    preferredLanguage: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    requiresInterpreter: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    preferredInterpreterGender: {
      type: DataTypes.ENUM('male', 'female', 'any'),
      defaultValue: 'any'
    },
    culturalNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true
  });

  return CulturalPreference;
}; 