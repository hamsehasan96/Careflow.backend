const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Define all models
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
    type: DataTypes.ENUM('admin', 'staff', 'participant'),
    defaultValue: 'participant'
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

const Participant = sequelize.define('Participant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  ndisNumber: {
    type: DataTypes.STRING
  },
  dateOfBirth: {
    type: DataTypes.DATE
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
  },
  culturalBackground: {
    type: DataTypes.STRING
  },
  preferredLanguage: {
    type: DataTypes.STRING,
    defaultValue: 'English'
  },
  requiresInterpreter: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  aboriginalOrTorresStrait: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  primaryDiagnosis: {
    type: DataTypes.STRING
  },
  secondaryDiagnosis: {
    type: DataTypes.STRING
  },
  allergies: {
    type: DataTypes.TEXT
  },
  medications: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  supportNeeds: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  emergencyContactName: {
    type: DataTypes.STRING
  },
  emergencyContactPhone: {
    type: DataTypes.STRING
  },
  emergencyContactRelationship: {
    type: DataTypes.STRING
  },
  guardianName: {
    type: DataTypes.STRING
  },
  guardianPhone: {
    type: DataTypes.STRING
  },
  guardianEmail: {
    type: DataTypes.STRING
  },
  guardianRelationship: {
    type: DataTypes.STRING
  },
  planStartDate: {
    type: DataTypes.DATE
  },
  planEndDate: {
    type: DataTypes.DATE
  },
  planStatus: {
    type: DataTypes.ENUM('active', 'pending', 'expired', 'under_review'),
    defaultValue: 'active'
  },
  fundingType: {
    type: DataTypes.ENUM('ndis_managed', 'self_managed', 'plan_managed', 'other'),
    defaultValue: 'ndis_managed'
  },
  planManagerName: {
    type: DataTypes.STRING
  },
  planManagerPhone: {
    type: DataTypes.STRING
  },
  planManagerEmail: {
    type: DataTypes.STRING
  },
  totalFunding: {
    type: DataTypes.DECIMAL(10, 2)
  },
  remainingFunding: {
    type: DataTypes.DECIMAL(10, 2)
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'on_hold', 'exited'),
    defaultValue: 'active'
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true
});

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  participantId: {
    type: DataTypes.UUID,
    references: {
      model: 'Participants',
      key: 'id'
    }
  },
  staffId: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.TEXT
  },
  supportCategory: {
    type: DataTypes.STRING
  },
  supportItemNumber: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'),
    defaultValue: 'scheduled'
  },
  cancellationReason: {
    type: DataTypes.STRING
  },
  cancellationNotice: {
    type: DataTypes.ENUM('none', 'same_day', '24_hours', '48_hours', 'more_than_48_hours'),
  },
  billable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  reminderSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true
});

const CareNote = sequelize.define('CareNote', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  participantId: {
    type: DataTypes.UUID,
    references: {
      model: 'Participants',
      key: 'id'
    }
  },
  appointmentId: {
    type: DataTypes.UUID,
    references: {
      model: 'Appointments',
      key: 'id'
    }
  },
  staffId: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  noteType: {
    type: DataTypes.ENUM('progress_note', 'assessment', 'plan', 'review', 'other'),
    defaultValue: 'progress_note'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  moodRating: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 5
    }
  },
  progressRating: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 5
    }
  },
  followUpRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  followUpDate: {
    type: DataTypes.DATE
  },
  followUpDescription: {
    type: DataTypes.TEXT
  },
  attachments: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('draft', 'completed', 'reviewed', 'archived'),
    defaultValue: 'draft'
  }
}, {
  timestamps: true
});

// Define associations
User.hasMany(Appointment, { foreignKey: 'staffId' });
Appointment.belongsTo(User, { foreignKey: 'staffId' });

User.hasOne(Participant, { foreignKey: 'userId' });
Participant.belongsTo(User, { foreignKey: 'userId' });

Participant.hasMany(Appointment, { foreignKey: 'participantId' });
Appointment.belongsTo(Participant, { foreignKey: 'participantId' });

Participant.hasMany(CareNote, { foreignKey: 'participantId' });
CareNote.belongsTo(Participant, { foreignKey: 'participantId' });

Appointment.hasMany(CareNote, { foreignKey: 'appointmentId' });
CareNote.belongsTo(Appointment, { foreignKey: 'appointmentId' });

User.hasMany(CareNote, { foreignKey: 'staffId' });
CareNote.belongsTo(User, { foreignKey: 'staffId' });

// Export models
module.exports = {
  User,
  Participant,
  Appointment,
  CareNote
};
