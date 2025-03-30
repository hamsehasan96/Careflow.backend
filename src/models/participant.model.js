const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Participant = sequelize.define('Participant', {
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
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  suburb: {
    type: DataTypes.STRING,
    allowNull: true
  },
  state: {
    type: DataTypes.STRING,
    defaultValue: 'WA',
    allowNull: true
  },
  postcode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  ndisNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      is: /^[0-9]{10}$/ // NDIS numbers are 10 digits
    }
  },
  planStartDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  planEndDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  planManagedBy: {
    type: DataTypes.ENUM('self', 'plan_manager', 'ndia'),
    allowNull: true
  },
  preferredLanguage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  interpreterRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  culturalBackground: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emergencyContactName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emergencyContactPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emergencyContactRelationship: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'pending'),
    defaultValue: 'active'
  },
  // New NDIS specific fields
  planType: {
    type: DataTypes.ENUM('self_managed', 'plan_managed', 'ndia_managed'),
    allowNull: true
  },
  planBudget: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  planReviewDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  // New elderly care specific fields
  medicareNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  pensionNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  healthConditions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  medications: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  allergies: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  mobilityLevel: {
    type: DataTypes.ENUM('independent', 'assisted', 'dependent'),
    allowNull: true
  },
  dietaryRequirements: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  preferredGP: {
    type: DataTypes.STRING,
    allowNull: true
  },
  preferredPharmacy: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Consent and privacy fields
  privacyConsent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  privacyConsentDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  consentToShare: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['ndisNumber'],
      unique: true
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Participant;
