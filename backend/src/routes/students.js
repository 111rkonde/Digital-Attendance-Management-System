const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { studentValidation } = require('../middleware/validation');
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentAttendance
} = require('../controllers/studentController');

// All routes require authentication
router.use(authenticate);

// Routes accessible by admin and teachers
router.get('/', authorize('admin', 'teacher'), getAllStudents);
router.get('/:id', authorize('admin', 'teacher'), getStudentById);

// Student can view their own profile and attendance
router.get('/profile/me', authorize('student'), async (req, res) => {
  // Redirect to getStudentById with the student's ID
  const { Student } = require('../models');
  const student = await Student.findOne({ where: { userId: req.user.id } });
  if (student) {
    req.params.id = student.id;
    return getStudentById(req, res);
  }
  res.status(404).json({ message: 'Student profile not found' });
});

router.get('/attendance/me', authorize('student'), async (req, res) => {
  const { Student } = require('../models');
  const student = await Student.findOne({ where: { userId: req.user.id } });
  if (student) {
    req.params.id = student.id;
    return getStudentAttendance(req, res);
  }
  res.status(404).json({ message: 'Student profile not found' });
});

router.get('/:id/attendance', authorize('admin', 'teacher'), getStudentAttendance);

// Admin-only routes
router.post('/', authorize('admin'), studentValidation, createStudent);
router.put('/:id', authorize('admin'), updateStudent);
router.delete('/:id', authorize('admin'), deleteStudent);

module.exports = router;
