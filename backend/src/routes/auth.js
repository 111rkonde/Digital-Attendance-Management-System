const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { loginValidation, registerValidation } = require('../middleware/validation');
const {
  login,
  register,
  getProfile,
  updateProfile
} = require('../controllers/authController');

// Public routes
router.post('/login', loginValidation, login);
router.post('/register', registerValidation, register);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

module.exports = router;
