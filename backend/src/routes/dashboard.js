const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  getTeacherDashboard,
  getStudentDashboard
} = require('../controllers/dashboardController');

// All routes require authentication
router.use(authenticate);

// Admin dashboard
router.get('/admin', authorize('admin'), getDashboardStats);

// Teacher dashboard
router.get('/teacher', authorize('teacher'), getTeacherDashboard);

// Student dashboard
router.get('/student', authorize('student'), getStudentDashboard);

// Generic dashboard - returns based on user role
router.get('/', async (req, res) => {
  const { role } = req.user;
  
  try {
    if (role === 'admin') {
      return getDashboardStats(req, res);
    } else if (role === 'teacher') {
      return getTeacherDashboard(req, res);
    } else if (role === 'student') {
      return getStudentDashboard(req, res);
    }
    res.status(403).json({ message: 'Unknown user role' });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard' });
  }
});

module.exports = router;
