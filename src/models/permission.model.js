const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    static associate(models) {
      // Define associations
      Permission.belongsToMany(models.Role, {
        through: 'RolePermissions',
        foreignKey: 'permissionId',
        otherKey: 'roleId'
      });
    }
  }
  
  Permission.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resource: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'The resource this permission applies to (e.g., participant, appointment)'
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'The action allowed on the resource (e.g., create, read, update, delete)'
    },
    conditions: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Optional conditions for when this permission applies'
    }
  }, {
    sequelize,
    modelName: 'Permission',
    tableName: 'permissions',
    timestamps: true
  });
  
  return Permission;
};
