const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { attendanceValidation } = require('../middleware/validation');
const {
  getAttendanceByClassAndDate,
  markAttendance,
  bulkMarkAttendance,
  updateAttendance,
  getAttendanceReport,
  sendDailyReport
} = require('../controllers/attendanceController');

// All routes require authentication
router.use(authenticate);

// Get attendance for a class on a specific date
router.get('/class/:classId/:date', authorize('admin', 'teacher'), getAttendanceByClassAndDate);

// Mark attendance (single or multiple records)
router.post('/mark', authorize('admin', 'teacher'), attendanceValidation, markAttendance);

// Bulk mark attendance
router.post('/bulk', authorize('admin', 'teacher'), bulkMarkAttendance);

// Update attendance record
router.put('/:id', authorize('admin', 'teacher'), updateAttendance);

// Get attendance reports
router.get('/report', authorize('admin'), getAttendanceReport);

// Send daily report email
router.post('/send-report', authorize('admin'), sendDailyReport);

module.exports = router;
