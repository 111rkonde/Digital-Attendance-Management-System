const { User, TeacherAssignment, Class, Subject } = require('../models');
const { Op } = require('sequelize');

const getAllUsers = async (req, res) => {
  try {
    const { role, isActive, search } = req.query;
    const whereClause = {};
    
    if (role) whereClause.role = role;
    if (isActive !== undefined) whereClause.isActive = isActive === 'true';
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: TeacherAssignment,
        as: 'assignments',
        where: { isActive: true },
        required: false,
        include: [
          {
            model: Class,
            as: 'class',
            attributes: ['id', 'name', 'section']
          },
          {
            model: Subject,
            as: 'subject',
            attributes: ['id', 'name', 'code']
          }
        ]
      }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error fetching user' });
  }
};

const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, phone } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: password || 'password123',
      role: role || 'teacher',
      phone
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error creating user' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, role, isActive } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent changing own role or deactivating self
    if (req.user.id === id) {
      if (role && role !== user.role) {
        return res.status(400).json({ message: 'Cannot change your own role' });
      }
      if (isActive === false) {
        return res.status(400).json({ message: 'Cannot deactivate your own account' });
      }
    }

    await user.update({
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      phone: phone !== undefined ? phone : user.phone,
      role: role || user.role,
      isActive: isActive !== undefined ? isActive : user.isActive
    });

    res.json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error updating user' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({ isActive: false });

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

const assignTeacher = async (req, res) => {
  try {
    const { teacherId, classId, subjectId, academicYear } = req.body;

    const assignment = await TeacherAssignment.create({
      teacherId,
      classId,
      subjectId,
      academicYear
    });

    const assignmentWithDetails = await TeacherAssignment.findByPk(assignment.id, {
      include: [
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'section']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'code']
        }
      ]
    });

    res.status(201).json({
      message: 'Teacher assigned successfully',
      assignment: assignmentWithDetails
    });
  } catch (error) {
    console.error('Assign teacher error:', error);
    res.status(500).json({ message: 'Server error assigning teacher' });
  }
};

const removeTeacherAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await TeacherAssignment.findByPk(id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    await assignment.update({ isActive: false });

    res.json({ message: 'Teacher assignment removed successfully' });
  } catch (error) {
    console.error('Remove assignment error:', error);
    res.status(500).json({ message: 'Server error removing assignment' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  assignTeacher,
  removeTeacherAssignment
};
