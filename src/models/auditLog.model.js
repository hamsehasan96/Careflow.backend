const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AuditLog extends Model {
    static associate(models) {
      // Define associations
      AuditLog.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }
  
  AuditLog.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the user who performed the action (null for system actions)'
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Type of action performed (e.g., login, create, update, delete)'
    },
    resourceType: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Type of resource affected (e.g., user, participant, appointment)'
    },
    resourceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the resource affected'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Human-readable description of the action'
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'IP address of the user who performed the action'
    },
    userAgent: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'User agent of the browser/client used'
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Additional metadata about the action'
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'success',
      comment: 'Status of the action (success, failure, error)'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'AuditLog',
    tableName: 'audit_logs',
    timestamps: true,
    indexes: [
      {
        name: 'audit_logs_user_id_idx',
        fields: ['userId']
      },
      {
        name: 'audit_logs_resource_type_resource_id_idx',
        fields: ['resourceType', 'resourceId']
      },
      {
        name: 'audit_logs_action_idx',
        fields: ['action']
      },
      {
        name: 'audit_logs_created_at_idx',
        fields: ['createdAt']
      }
    ]
  });
  
  return AuditLog;
};
