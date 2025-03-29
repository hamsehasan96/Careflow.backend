const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING
  },
  position: {
    type: DataTypes.STRING
  },
  department: {
    type: DataTypes.STRING
  },
  employmentType: {
    type: DataTypes.ENUM('full_time', 'part_time', 'casual', 'contractor'),
    defaultValue: 'full_time'
  },
  startDate: {
    type: DataTypes.DATE
  },
  emergencyContactName: {
    type: DataTypes.STRING
  },
  emergencyContactPhone: {
    type: DataTypes.STRING
  },
  address: {
    type: DataTypes.STRING
  },
  suburb: {
    type: DataTypes.STRING
  },
  state: {
    type: DataTypes.STRING,
    defaultValue: 'WA'
  },
  postcode: {
    type: DataTypes.STRING
  },
  qualifications: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  languages: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  profileImage: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'on_leave', 'terminated'),
    defaultValue: 'active'
  },
  
  // Credentials
  policeCheckDate: {
    type: DataTypes.DATE
  },
  policeCheckExpiry: {
    type: DataTypes.DATE
  },
  policeCheckDocument: {
    type: DataTypes.STRING
  },
  
  wwccNumber: {
    type: DataTypes.STRING
  },
  wwccExpiry: {
    type: DataTypes.DATE
  },
  wwccDocument: {
    type: DataTypes.STRING
  },
  
  firstAidDate: {
    type: DataTypes.DATE
  },
  firstAidExpiry: {
    type: DataTypes.DATE
  },
  firstAidDocument: {
    type: DataTypes.STRING
  },
  
  cprDate: {
    type: DataTypes.DATE
  },
  cprExpiry: {
    type: DataTypes.DATE
  },
  cprDocument: {
    type: DataTypes.STRING
  },
  
  // Access control
  role: {
    type: DataTypes.ENUM('admin', 'manager', 'coordinator', 'support_worker', 'office_staff'),
    defaultValue: 'support_worker'
  },
  permissions: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  
  // Timestamps
  lastLogin: {
    type: DataTypes.DATE
  }
}, {
  timestamps: true
});

module.exports = User;
