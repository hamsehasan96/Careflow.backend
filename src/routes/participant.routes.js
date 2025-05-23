const path = require('path');
const express = require('express');
const router = express.Router();
const { authenticate, hasPermission } = require(path.join(__dirname, '..', 'middleware', 'rbac.middleware'));
const { handleValidationErrors } = require(path.join(__dirname, '..', 'middleware', 'validation.middleware'));
const { sanitizeBody } = require(path.join(__dirname, '..', 'middleware', 'sanitization.middleware'));
const { Participant, CareWorker } = require(path.join(__dirname, '..', 'models'));
const logger = require(path.join(__dirname, '..', 'config', 'logger'));
const { body, validationResult } = require('express-validator');
const { auth, checkRole } = require(path.join(__dirname, '..', 'middleware', 'auth.middleware'));

// Placeholder for participant controller
// This would be implemented with actual database operations
const participantController = {
  getAllParticipants: (req, res) => {
    res.json({ message: 'Get all participants' });
  },
  getParticipantById: (req, res) => {
    res.json({ message: `Get participant with ID: ${req.params.id}` });
  },
  createParticipant: (req, res) => {
    res.json({ message: 'Create new participant', data: req.body });
  },
  updateParticipant: (req, res) => {
    res.json({ message: `Update participant with ID: ${req.params.id}`, data: req.body });
  },
  deleteParticipant: (req, res) => {
    res.json({ message: `Delete participant with ID: ${req.params.id}` });
  }
};

// Validation rules
const participantValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('ndisNumber').optional().isString().withMessage('NDIS number must be a string'),
  body('dateOfBirth').optional().isISO8601().withMessage('Date of birth must be a valid date'),
  body('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_to_say']).withMessage('Invalid gender'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('preferredLanguage').optional().isString().withMessage('Preferred language must be a string'),
  body('requiresInterpreter').optional().isBoolean().withMessage('Requires interpreter must be a boolean'),
  body('primaryDiagnosis').optional().isString().withMessage('Primary diagnosis must be a string'),
  body('emergencyContactName').optional().isString().withMessage('Emergency contact name must be a string'),
  body('emergencyContactPhone').optional().isMobilePhone().withMessage('Valid emergency contact phone is required'),
  body('emergencyContactRelationship').optional().isString().withMessage('Emergency contact relationship must be a string'),
  body('planStartDate').optional().isISO8601().withMessage('Plan start date must be a valid date'),
  body('planEndDate').optional().isISO8601().withMessage('Plan end date must be a valid date'),
  body('planStatus').optional().isIn(['active', 'pending', 'expired']).withMessage('Invalid plan status'),
  body('fundingType').optional().isIn(['ndis_managed', 'self_managed', 'plan_managed']).withMessage('Invalid funding type'),
  body('totalFunding').optional().isNumeric().withMessage('Total funding must be a number'),
  body('remainingFunding').optional().isNumeric().withMessage('Remaining funding must be a number'),
  body('status').optional().isIn(['active', 'inactive', 'on_hold']).withMessage('Invalid status')
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
router.get('/', auth, checkRole(['admin', 'staff']), participantController.getAllParticipants);
router.get('/:id', auth, checkRole(['admin', 'staff']), participantController.getParticipantById);
router.post('/', auth, checkRole(['admin']), participantValidation, validate, participantController.createParticipant);
router.put('/:id', auth, checkRole(['admin', 'staff']), participantValidation, validate, participantController.updateParticipant);
router.delete('/:id', auth, checkRole(['admin']), participantController.deleteParticipant);

module.exports = router;
