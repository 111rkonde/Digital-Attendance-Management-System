const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { subjectValidation } = require('../middleware/validation');
const {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject
} = require('../controllers/subjectController');

// All routes require authentication
router.use(authenticate);

// Routes accessible by all authenticated users
router.get('/', getAllSubjects);
router.get('/:id', getSubjectById);

// Admin-only routes
router.post('/', authorize('admin'), subjectValidation, createSubject);
router.put('/:id', authorize('admin'), subjectValidation, updateSubject);
router.delete('/:id', authorize('admin'), deleteSubject);

module.exports = router;
