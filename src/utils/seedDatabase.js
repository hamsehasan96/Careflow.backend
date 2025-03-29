const bcrypt = require('bcryptjs');
const { User, Participant, Appointment, CareNote } = require('../models');
const sequelize = require('../config/database');

// Seed data function
const seedDatabase = async () => {
  try {
    // Sync database models
    await sequelize.sync({ force: true });
    console.log('Database synced successfully');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@careflow.com',
      password: adminPassword,
      role: 'admin',
      phone: '0412345678',
      position: 'System Administrator',
      department: 'IT',
      status: 'active',
      lastLogin: new Date()
    });

    // Create staff user
    const staffPassword = await bcrypt.hash('staff123', 10);
    const staff = await User.create({
      firstName: 'Staff',
      lastName: 'Member',
      email: 'staff@careflow.com',
      password: staffPassword,
      role: 'staff',
      phone: '0423456789',
      position: 'Support Worker',
      department: 'Care Services',
      status: 'active',
      lastLogin: new Date()
    });

    // Create participant user
    const participantPassword = await bcrypt.hash('participant123', 10);
    const participantUser = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'participant@careflow.com',
      password: participantPassword,
      role: 'participant',
      phone: '0434567890',
      status: 'active',
      lastLogin: new Date()
    });

    // Create participant profile
    const participant = await Participant.create({
      userId: participantUser.id,
      ndisNumber: 'NDIS123456',
      dateOfBirth: new Date(1985, 5, 15),
      gender: 'male',
      preferredLanguage: 'English',
      requiresInterpreter: false,
      primaryDiagnosis: 'Autism Spectrum Disorder',
      emergencyContactName: 'Jane Doe',
      emergencyContactPhone: '0445678901',
      emergencyContactRelationship: 'Sister',
      planStartDate: new Date(2023, 0, 1),
      planEndDate: new Date(2024, 0, 1),
      planStatus: 'active',
      fundingType: 'ndis_managed',
      totalFunding: 50000.00,
      remainingFunding: 35000.00,
      status: 'active'
    });

    // Create appointments
    const appointment1 = await Appointment.create({
      participantId: participant.id,
      staffId: staff.id,
      title: 'Initial Assessment',
      startTime: new Date(2023, 3, 15, 10, 0),
      endTime: new Date(2023, 3, 15, 11, 0),
      location: 'CareFlow Office',
      description: 'Initial assessment to determine support needs',
      supportCategory: 'Core Supports',
      supportItemNumber: '01_011_0107_1_1',
      status: 'completed',
      billable: true
    });

    const appointment2 = await Appointment.create({
      participantId: participant.id,
      staffId: staff.id,
      title: 'Weekly Support Session',
      startTime: new Date(2023, 3, 22, 10, 0),
      endTime: new Date(2023, 3, 22, 11, 0),
      location: 'Participant Home',
      description: 'Regular weekly support session',
      supportCategory: 'Core Supports',
      supportItemNumber: '01_011_0107_1_1',
      status: 'scheduled',
      billable: true
    });

    // Create care notes
    await CareNote.create({
      participantId: participant.id,
      appointmentId: appointment1.id,
      staffId: staff.id,
      noteType: 'assessment',
      title: 'Initial Assessment Notes',
      content: 'John presented well during the initial assessment. He expressed interest in developing independent living skills and social skills. We discussed goals for the next 3 months.',
      moodRating: 4,
      progressRating: 3,
      followUpRequired: true,
      followUpDate: new Date(2023, 3, 22),
      followUpDescription: 'Follow up on progress with initial goals',
      status: 'completed'
    });

    console.log('Seed data created successfully');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
};

module.exports = seedDatabase;
