const { body, validationResult } = require('express-validator');
const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth.middleware');
const {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment
} = require('../controllers/appointment.controller');

// Placeholder for appointment controller
// This would be implemented with actual database operations
const appointmentController = {
  getAllAppointments: (req, res) => {
    res.json({ message: 'Get all appointments' });
  },
  getAppointmentById: (req, res) => {
    res.json({ message: `Get appointment with ID: ${req.params.id}` });
  },
  createAppointment: (req, res) => {
    res.json({ message: 'Create new appointment', data: req.body });
  },
  updateAppointment: (req, res) => {
    res.json({ message: `Update appointment with ID: ${req.params.id}`, data: req.body });
  },
  deleteAppointment: (req, res) => {
    res.json({ message: `Delete appointment with ID: ${req.params.id}` });
  }
};

// Validation rules
const appointmentValidation = [
  body('participantId').notEmpty().isInt().withMessage('Valid participant ID is required'),
  body('staffId').notEmpty().isInt().withMessage('Valid staff ID is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('startTime').notEmpty().isISO8601().withMessage('Valid start time is required'),
  body('endTime').notEmpty().isISO8601().withMessage('Valid end time is required')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startTime)) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  body('location').notEmpty().withMessage('Location is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('supportCategory').optional().isString().withMessage('Support category must be a string'),
  body('supportItemNumber').optional().isString().withMessage('Support item number must be a string'),
  body('status').optional().isIn(['scheduled', 'completed', 'cancelled', 'no_show']).withMessage('Invalid status'),
  body('billable').optional().isBoolean().withMessage('Billable must be a boolean')
];

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Routes with role-based access control
router.get('/', auth, checkRole(['admin', 'staff']), getAllAppointments);
router.get('/:id', auth, checkRole(['admin', 'staff']), getAppointmentById);
router.post('/', auth, checkRole(['admin', 'staff']), appointmentValidation, validate, createAppointment);
router.put('/:id', auth, checkRole(['admin', 'staff']), appointmentValidation, validate, updateAppointment);
router.delete('/:id', auth, checkRole(['admin', 'staff']), deleteAppointment);

module.exports = router;
