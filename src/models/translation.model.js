module.exports = (sequelize, DataTypes) => {
  const Translation = sequelize.define('Translation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false
    },
    languageCode: {
      type: DataTypes.STRING(5),
      allowNull: false
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    context: {
      type: DataTypes.STRING,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('ui', 'email', 'document', 'form', 'report'),
      allowNull: false
    }
  }, {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['key', 'languageCode']
      }
    ]
  });

  return Translation;
}; 