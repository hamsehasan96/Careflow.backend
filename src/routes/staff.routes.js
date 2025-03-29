const { body, validationResult } = require('express-validator');
const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth.middleware');

// Placeholder for staff controller
// This would be implemented with actual database operations
const staffController = {
  getAllStaff: (req, res) => {
    res.json({ message: 'Get all staff members' });
  },
  getStaffById: (req, res) => {
    res.json({ message: `Get staff member with ID: ${req.params.id}` });
  },
  createStaff: (req, res) => {
    res.json({ message: 'Create new staff member', data: req.body });
  },
  updateStaff: (req, res) => {
    res.json({ message: `Update staff member with ID: ${req.params.id}`, data: req.body });
  },
  deleteStaff: (req, res) => {
    res.json({ message: `Delete staff member with ID: ${req.params.id}` });
  }
};

// Validation rules
const staffValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('position').optional().isString().withMessage('Position must be a string'),
  body('department').optional().isString().withMessage('Department must be a string'),
  body('employmentType').optional().isIn(['full_time', 'part_time', 'casual', 'contractor']).withMessage('Invalid employment type'),
  body('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  body('emergencyContactName').optional().isString().withMessage('Emergency contact name must be a string'),
  body('emergencyContactPhone').optional().isMobilePhone().withMessage('Valid emergency contact phone is required'),
  body('qualifications').optional().isArray().withMessage('Qualifications must be an array'),
  body('languages').optional().isArray().withMessage('Languages must be an array'),
  body('status').optional().isIn(['active', 'inactive', 'on_leave']).withMessage('Invalid status'),
  body('policeCheckDate').optional().isISO8601().withMessage('Police check date must be a valid date'),
  body('policeCheckExpiry').optional().isISO8601().withMessage('Police check expiry must be a valid date'),
  body('wwccNumber').optional().isString().withMessage('WWCC number must be a string'),
  body('wwccExpiry').optional().isISO8601().withMessage('WWCC expiry must be a valid date'),
  body('firstAidDate').optional().isISO8601().withMessage('First aid date must be a valid date'),
  body('firstAidExpiry').optional().isISO8601().withMessage('First aid expiry must be a valid date'),
  body('role').optional().isIn(['admin', 'staff']).withMessage('Invalid role')
];

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Routes with role-based access control (admin only)
router.get('/', auth, checkRole(['admin']), staffController.getAllStaff);
router.get('/:id', auth, checkRole(['admin']), staffController.getStaffById);
router.post('/', auth, checkRole(['admin']), staffValidation, validate, staffController.createStaff);
router.put('/:id', auth, checkRole(['admin']), staffValidation, validate, staffController.updateStaff);
router.delete('/:id', auth, checkRole(['admin']), staffController.deleteStaff);

module.exports = router;
