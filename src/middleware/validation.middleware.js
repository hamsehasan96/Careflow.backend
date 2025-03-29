const { body, validationResult, param, query } = require('express-validator');
const sanitizeHtml = require('sanitize-html');

// Common validation chains
const nameValidation = () => body('name')
  .notEmpty().withMessage('Name is required')
  .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
  .trim()
  .escape();

const emailValidation = () => body('email')
  .notEmpty().withMessage('Email is required')
  .isEmail().withMessage('Invalid email format')
  .normalizeEmail();

const passwordValidation = () => body('password')
  .notEmpty().withMessage('Password is required')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');

const phoneValidation = () => body('contactNumber')
  .optional()
  .isMobilePhone('any').withMessage('Invalid phone number format')
  .trim();

const dateValidation = (fieldName) => body(fieldName)
  .optional()
  .isISO8601().withMessage('Invalid date format')
  .toDate();

const idValidation = (paramName) => param(paramName)
  .isInt().withMessage('Invalid ID format')
  .toInt();

// Validation middleware for different routes
const validate = {
  // Auth validations
  login: [
    emailValidation(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  
  register: [
    nameValidation(),
    emailValidation(),
    passwordValidation(),
    body('role')
      .notEmpty().withMessage('Role is required')
      .isIn(['admin', 'staff', 'manager']).withMessage('Invalid role'),
  ],
  
  // Participant validations
  createParticipant: [
    nameValidation(),
    body('dateOfBirth')
      .notEmpty().withMessage('Date of birth is required')
      .isISO8601().withMessage('Invalid date format')
      .toDate(),
    body('gender')
      .optional()
      .isIn(['Male', 'Female', 'Non-binary', 'Prefer not to say']).withMessage('Invalid gender'),
    body('serviceType')
      .notEmpty().withMessage('Service type is required')
      .isIn(['NDIS', 'Aged Care']).withMessage('Invalid service type'),
    emailValidation().optional(),
    phoneValidation(),
    body('address')
      .optional()
      .isLength({ max: 200 }).withMessage('Address must be less than 200 characters')
      .trim()
      .escape(),
    body('culturalBackground')
      .optional()
      .isLength({ max: 100 }).withMessage('Cultural background must be less than 100 characters')
      .trim()
      .escape(),
    body('preferredLanguage')
      .optional()
      .isLength({ max: 50 }).withMessage('Preferred language must be less than 50 characters')
      .trim()
      .escape(),
    body('ndisNumber')
      .optional()
      .isLength({ max: 20 }).withMessage('NDIS number must be less than 20 characters')
      .trim()
      .escape(),
    dateValidation('planStartDate'),
    dateValidation('planEndDate'),
  ],
  
  updateParticipant: [
    idValidation('id'),
    nameValidation().optional(),
    body('dateOfBirth')
      .optional()
      .isISO8601().withMessage('Invalid date format')
      .toDate(),
    body('gender')
      .optional()
      .isIn(['Male', 'Female', 'Non-binary', 'Prefer not to say']).withMessage('Invalid gender'),
    body('serviceType')
      .optional()
      .isIn(['NDIS', 'Aged Care']).withMessage('Invalid service type'),
    body('email')
      .optional()
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
    phoneValidation(),
    body('address')
      .optional()
      .isLength({ max: 200 }).withMessage('Address must be less than 200 characters')
      .trim()
      .escape(),
  ],
  
  getParticipant: [
    idValidation('id'),
  ],
  
  // Appointment validations
  createAppointment: [
    body('participantId')
      .notEmpty().withMessage('Participant ID is required')
      .isInt().withMessage('Invalid participant ID format')
      .toInt(),
    body('staffId')
      .notEmpty().withMessage('Staff ID is required')
      .isInt().withMessage('Invalid staff ID format')
      .toInt(),
    body('date')
      .notEmpty().withMessage('Date is required')
      .isISO8601().withMessage('Invalid date format')
      .toDate(),
    body('startTime')
      .notEmpty().withMessage('Start time is required')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format (HH:MM)'),
    body('endTime')
      .notEmpty().withMessage('End time is required')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format (HH:MM)'),
    body('service')
      .notEmpty().withMessage('Service is required')
      .isLength({ max: 100 }).withMessage('Service must be less than 100 characters')
      .trim()
      .escape(),
    body('location')
      .optional()
      .isLength({ max: 200 }).withMessage('Location must be less than 200 characters')
      .trim()
      .escape(),
    body('notes')
      .optional()
      .isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters')
      .customSanitizer(value => sanitizeHtml(value, {
        allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br'],
        allowedAttributes: {}
      })),
  ],
  
  // Invoice validations
  createInvoice: [
    body('participantId')
      .notEmpty().withMessage('Participant ID is required')
      .isInt().withMessage('Invalid participant ID format')
      .toInt(),
    body('invoiceDate')
      .notEmpty().withMessage('Invoice date is required')
      .isISO8601().withMessage('Invalid date format')
      .toDate(),
    body('dueDate')
      .notEmpty().withMessage('Due date is required')
      .isISO8601().withMessage('Invalid date format')
      .toDate(),
    body('items')
      .isArray().withMessage('Items must be an array')
      .notEmpty().withMessage('At least one item is required'),
    body('items.*.description')
      .notEmpty().withMessage('Item description is required')
      .isLength({ max: 200 }).withMessage('Description must be less than 200 characters')
      .trim()
      .escape(),
    body('items.*.quantity')
      .notEmpty().withMessage('Item quantity is required')
      .isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0')
      .toFloat(),
    body('items.*.unitPrice')
      .notEmpty().withMessage('Item unit price is required')
      .isFloat({ min: 0 }).withMessage('Unit price must be greater than or equal to 0')
      .toFloat(),
  ],
  
  // Care note validations
  createCareNote: [
    body('participantId')
      .notEmpty().withMessage('Participant ID is required')
      .isInt().withMessage('Invalid participant ID format')
      .toInt(),
    body('staffId')
      .notEmpty().withMessage('Staff ID is required')
      .isInt().withMessage('Invalid staff ID format')
      .toInt(),
    body('date')
      .notEmpty().withMessage('Date is required')
      .isISO8601().withMessage('Invalid date format')
      .toDate(),
    body('noteType')
      .notEmpty().withMessage('Note type is required')
      .isIn(['Progress Note', 'Incident Report', 'Assessment', 'Plan Review']).withMessage('Invalid note type'),
    body('content')
      .notEmpty().withMessage('Content is required')
      .isLength({ max: 5000 }).withMessage('Content must be less than 5000 characters')
      .customSanitizer(value => sanitizeHtml(value, {
        allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
        allowedAttributes: {}
      })),
  ],
  
  // Search validations
  search: [
    query('q')
      .optional()
      .isLength({ min: 2 }).withMessage('Search query must be at least 2 characters')
      .trim()
      .escape(),
    query('type')
      .optional()
      .isIn(['participant', 'appointment', 'invoice', 'carenote']).withMessage('Invalid search type'),
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer')
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
      .toInt(),
  ],
};

// Validation result handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  validate,
  handleValidationErrors,
  sanitizeHtml
};
