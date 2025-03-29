const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/user.model');
const { differenceInDays } = require('date-fns');

// Get all staff members
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['lastName', 'ASC'], ['firstName', 'ASC']]
    });
    
    res.status(200).json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get staff member by ID
exports.getStaffById = async (req, res) => {
  try {
    const staff = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    
    res.status(200).json(staff);
  } catch (error) {
    console.error('Error fetching staff member:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new staff member
exports.createStaff = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    // Check if email already exists
    const existingUser = await User.findOne({ where: { email: req.body.email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    
    // Create new staff member
    const newStaff = await User.create({
      ...req.body,
      password: hashedPassword
    });
    
    // Return the new staff member without password
    const { password, ...staffData } = newStaff.toJSON();
    res.status(201).json(staffData);
  } catch (error) {
    console.error('Error creating staff member:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update staff member
exports.updateStaff = async (req, res) => {
  try {
    const staff = await User.findByPk(req.params.id);
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    
    // If password is being updated, hash it
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    
    await staff.update(req.body);
    
    // Return the updated staff member without password
    const { password, ...staffData } = staff.toJSON();
    res.status(200).json(staffData);
  } catch (error) {
    console.error('Error updating staff member:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete staff member
exports.deleteStaff = async (req, res) => {
  try {
    const staff = await User.findByPk(req.params.id);
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    
    await staff.destroy();
    
    res.status(200).json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get staff members with expiring credentials
exports.getStaffWithExpiringCredentials = async (req, res) => {
  try {
    const staff = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    
    // Filter staff with credentials expiring within 30 days
    const staffWithExpiringCredentials = staff.filter(member => {
      const credentials = [
        { name: 'Police Check', expiry: member.policeCheckExpiry },
        { name: 'WWCC', expiry: member.wwccExpiry },
        { name: 'First Aid', expiry: member.firstAidExpiry },
        { name: 'CPR', expiry: member.cprExpiry }
      ];
      
      return credentials.some(credential => {
        if (!credential.expiry) return false;
        
        const daysUntilExpiry = differenceInDays(new Date(credential.expiry), new Date());
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
      });
    });
    
    res.status(200).json(staffWithExpiringCredentials);
  } catch (error) {
    console.error('Error fetching staff with expiring credentials:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get staff members with expired credentials
exports.getStaffWithExpiredCredentials = async (req, res) => {
  try {
    const staff = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    
    // Filter staff with expired credentials
    const staffWithExpiredCredentials = staff.filter(member => {
      const credentials = [
        { name: 'Police Check', expiry: member.policeCheckExpiry },
        { name: 'WWCC', expiry: member.wwccExpiry },
        { name: 'First Aid', expiry: member.firstAidExpiry },
        { name: 'CPR', expiry: member.cprExpiry }
      ];
      
      return credentials.some(credential => {
        if (!credential.expiry) return false;
        
        return new Date(credential.expiry) < new Date();
      });
    });
    
    res.status(200).json(staffWithExpiredCredentials);
  } catch (error) {
    console.error('Error fetching staff with expired credentials:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update staff credentials
exports.updateStaffCredentials = async (req, res) => {
  try {
    const staff = await User.findByPk(req.params.id);
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    
    // Update only credential fields
    const credentialFields = [
      'policeCheckDate', 'policeCheckExpiry', 'policeCheckDocument',
      'wwccNumber', 'wwccExpiry', 'wwccDocument',
      'firstAidDate', 'firstAidExpiry', 'firstAidDocument',
      'cprDate', 'cprExpiry', 'cprDocument'
    ];
    
    const updateData = {};
    credentialFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    await staff.update(updateData);
    
    // Return the updated staff member without password
    const { password, ...staffData } = staff.toJSON();
    res.status(200).json(staffData);
  } catch (error) {
    console.error('Error updating staff credentials:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get staff by role
exports.getStaffByRole = async (req, res) => {
  try {
    const staff = await User.findAll({
      where: { role: req.params.role },
      attributes: { exclude: ['password'] },
      order: [['lastName', 'ASC'], ['firstName', 'ASC']]
    });
    
    res.status(200).json(staff);
  } catch (error) {
    console.error('Error fetching staff by role:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
