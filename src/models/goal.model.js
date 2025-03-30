module.exports = (sequelize, DataTypes) => {
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
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM('daily_living', 'social', 'health', 'education', 'employment', 'other'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'on_hold', 'cancelled'),
      defaultValue: 'active'
    },
    priority: {
      type: DataTypes.ENUM('high', 'medium', 'low'),
      defaultValue: 'medium'
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    targetDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      }
    },
    milestones: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    timestamps: true
  });

  // Define associations
  Goal.associate = (models) => {
    Goal.belongsTo(models.Participant, {
      foreignKey: 'participantId',
      as: 'participant'
    });
    Goal.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
  };

  return Goal;
};
