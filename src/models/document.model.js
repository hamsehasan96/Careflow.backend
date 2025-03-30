module.exports = (sequelize, DataTypes) => {
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
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('ndis_plan', 'medical_report', 'assessment', 'consent', 'other'),
      allowNull: false
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    uploadedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'archived', 'deleted'),
      defaultValue: 'active'
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  }, {
    timestamps: true
  });

  // Define associations
  Document.associate = (models) => {
    Document.belongsTo(models.Participant, {
      foreignKey: 'participantId',
      as: 'participant'
    });
    Document.belongsTo(models.User, {
      foreignKey: 'uploadedBy',
      as: 'uploader'
    });
  };

  return Document;
};
