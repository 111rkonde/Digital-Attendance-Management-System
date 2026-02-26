const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

const registerValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'teacher', 'student']).withMessage('Invalid role'),
  handleValidationErrors
];

const classValidation = [
  body('name').trim().notEmpty().withMessage('Class name is required'),
  body('section').trim().notEmpty().withMessage('Section is required'),
  body('academicYear').trim().notEmpty().withMessage('Academic year is required'),
  handleValidationErrors
];

const subjectValidation = [
  body('name').trim().notEmpty().withMessage('Subject name is required'),
  body('code').trim().notEmpty().withMessage('Subject code is required'),
  handleValidationErrors
];

const studentValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('rollNumber').trim().notEmpty().withMessage('Roll number is required'),
  body('classId').notEmpty().withMessage('Class ID is required'),
  handleValidationErrors
];

const attendanceValidation = [
  body('records').isArray({ min: 1 }).withMessage('At least one attendance record is required'),
  body('records.*.studentId').notEmpty().withMessage('Student ID is required'),
  body('records.*.status').isIn(['present', 'absent', 'late']).withMessage('Status must be present, absent, or late'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  handleValidationErrors
];

module.exports = {
  loginValidation,
  registerValidation,
  classValidation,
  subjectValidation,
  studentValidation,
  attendanceValidation
};
