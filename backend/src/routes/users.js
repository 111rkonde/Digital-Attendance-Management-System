const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { registerValidation } = require('../middleware/validation');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  assignTeacher,
  removeTeacherAssignment
} = require('../controllers/userController');

// All routes require authentication and admin role
router.use(authenticate, authorize('admin'));

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', registerValidation, createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/assign', assignTeacher);
router.delete('/assign/:id', removeTeacherAssignment);

module.exports = router;
