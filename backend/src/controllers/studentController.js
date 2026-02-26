const { Student, User, Class, Attendance } = require('../models');
const { Op } = require('sequelize');

const getAllStudents = async (req, res) => {
  try {
    const { classId, isActive, search } = req.query;
    const whereClause = {};
    
    if (classId) whereClause.classId = classId;
    if (isActive !== undefined) whereClause.isActive = isActive === 'true';

    const students = await Student.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          where: search ? {
            [Op.or]: [
              { firstName: { [Op.iLike]: `%${search}%` } },
              { lastName: { [Op.iLike]: `%${search}%` } },
              { email: { [Op.iLike]: `%${search}%` } }
            ]
          } : undefined,
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'section']
        }
      ],
      order: [['rollNumber', 'ASC']]
    });

    res.json({ students });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error fetching students' });
  }
};

const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await Student.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: Class,
          as: 'class'
        }
      ]
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ student });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ message: 'Server error fetching student' });
  }
};

const createStudent = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      rollNumber,
      classId,
      dateOfBirth,
      gender,
      address,
      parentName,
      parentPhone,
      parentEmail
    } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Check if roll number exists in the same class
    const existingStudent = await Student.findOne({
      where: { rollNumber, classId }
    });
    if (existingStudent) {
      return res.status(400).json({ message: 'Roll number already exists in this class' });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: password || 'student123', // Default password
      role: 'student',
      phone
    });

    // Create student profile
    const student = await Student.create({
      userId: user.id,
      rollNumber,
      classId,
      dateOfBirth,
      gender,
      address,
      parentName,
      parentPhone,
      parentEmail
    });

    const studentWithDetails = await Student.findByPk(student.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: Class,
          as: 'class'
        }
      ]
    });

    res.status(201).json({
      message: 'Student created successfully',
      student: studentWithDetails
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ message: 'Server error creating student' });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      phone,
      rollNumber,
      classId,
      dateOfBirth,
      gender,
      address,
      parentName,
      parentPhone,
      parentEmail,
      isActive
    } = req.body;

    const student = await Student.findByPk(id, {
      include: [{ model: User, as: 'user' }]
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check roll number uniqueness if changed
    if (rollNumber && (rollNumber !== student.rollNumber || classId !== student.classId)) {
      const existingStudent = await Student.findOne({
        where: {
          rollNumber,
          classId: classId || student.classId,
          id: { [Op.ne]: id }
        }
      });
      if (existingStudent) {
        return res.status(400).json({ message: 'Roll number already exists in this class' });
      }
    }

    // Update user
    await student.user.update({
      firstName: firstName || student.user.firstName,
      lastName: lastName || student.user.lastName,
      phone: phone !== undefined ? phone : student.user.phone
    });

    // Update student
    await student.update({
      rollNumber: rollNumber || student.rollNumber,
      classId: classId || student.classId,
      dateOfBirth: dateOfBirth !== undefined ? dateOfBirth : student.dateOfBirth,
      gender: gender || student.gender,
      address: address !== undefined ? address : student.address,
      parentName: parentName !== undefined ? parentName : student.parentName,
      parentPhone: parentPhone !== undefined ? parentPhone : student.parentPhone,
      parentEmail: parentEmail !== undefined ? parentEmail : student.parentEmail,
      isActive: isActive !== undefined ? isActive : student.isActive
    });

    const updatedStudent = await Student.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: Class,
          as: 'class'
        }
      ]
    });

    res.json({
      message: 'Student updated successfully',
      student: updatedStudent
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Server error updating student' });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findByPk(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await student.update({ isActive: false });
    await User.update({ isActive: false }, { where: { id: student.userId } });

    res.json({ message: 'Student deactivated successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Server error deleting student' });
  }
};

const getStudentAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const whereClause = { studentId: id };
    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    const attendance = await Attendance.findAll({
      where: whereClause,
      include: [
        {
          model: Class,
          as: 'class',
          attributes: ['name', 'section']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['name', 'code']
        }
      ],
      order: [['date', 'DESC']]
    });

    // Calculate statistics
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const late = attendance.filter(a => a.status === 'late').length;
    const percentage = total > 0 ? ((present + late) / total * 100).toFixed(2) : 0;

    res.json({
      attendance,
      statistics: {
        total,
        present,
        absent,
        late,
        percentage
      }
    });
  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({ message: 'Server error fetching attendance' });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentAttendance
};
