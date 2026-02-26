const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { classValidation } = require('../middleware/validation');
const {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getAcademicYears
} = require('../controllers/classController');

// All routes require authentication
router.use(authenticate);

// Routes accessible by all authenticated users
router.get('/', getAllClasses);
router.get('/years', getAcademicYears);
router.get('/:id', getClassById);

// Admin-only routes
router.post('/', authorize('admin'), classValidation, createClass);
router.put('/:id', authorize('admin'), classValidation, updateClass);
router.delete('/:id', authorize('admin'), deleteClass);

module.exports = router;
