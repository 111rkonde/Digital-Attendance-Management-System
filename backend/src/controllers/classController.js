const { Class, Student, User, TeacherAssignment, Subject } = require('../models');
const { Op } = require('sequelize');

const getAllClasses = async (req, res) => {
  try {
    const { academicYear, isActive } = req.query;
    const whereClause = {};
    
    if (academicYear) whereClause.academicYear = academicYear;
    if (isActive !== undefined) whereClause.isActive = isActive === 'true';

    const classes = await Class.findAll({
      where: whereClause,
      order: [['name', 'ASC'], ['section', 'ASC']],
      include: [{
        model: Student,
        as: 'students',
        include: [{
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email']
        }]
      }]
    });

    res.json({ classes });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ message: 'Server error fetching classes' });
  }
};

const getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const classData = await Class.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'students',
          where: { isActive: true },
          required: false,
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'email']
          }]
        },
        {
          model: TeacherAssignment,
          as: 'teacherAssignments',
          where: { isActive: true },
          required: false,
          include: [
            {
              model: User,
              as: 'teacher',
              attributes: ['id', 'firstName', 'lastName', 'email']
            },
            {
              model: Subject,
              as: 'subject',
              attributes: ['id', 'name', 'code']
            }
          ]
        }
      ]
    });

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json({ class: classData });
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({ message: 'Server error fetching class' });
  }
};

const createClass = async (req, res) => {
  try {
    const { name, section, academicYear } = req.body;

    // Check if class already exists
    const existingClass = await Class.findOne({
      where: { name, section, academicYear }
    });

    if (existingClass) {
      return res.status(400).json({ message: 'Class already exists' });
    }

    const newClass = await Class.create({
      name,
      section,
      academicYear
    });

    res.status(201).json({
      message: 'Class created successfully',
      class: newClass
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ message: 'Server error creating class' });
  }
};

const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, section, academicYear, isActive } = req.body;

    const classData = await Class.findByPk(id);
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check for duplicate if name/section/year changed
    if (name !== classData.name || section !== classData.section || academicYear !== classData.academicYear) {
      const existingClass = await Class.findOne({
        where: {
          name: name || classData.name,
          section: section || classData.section,
          academicYear: academicYear || classData.academicYear,
          id: { [Op.ne]: id }
        }
      });

      if (existingClass) {
        return res.status(400).json({ message: 'Class with these details already exists' });
      }
    }

    await classData.update({
      name: name || classData.name,
      section: section || classData.section,
      academicYear: academicYear || classData.academicYear,
      isActive: isActive !== undefined ? isActive : classData.isActive
    });

    res.json({
      message: 'Class updated successfully',
      class: classData
    });
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({ message: 'Server error updating class' });
  }
};

const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    const classData = await Class.findByPk(id);
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Soft delete by setting isActive to false
    await classData.update({ isActive: false });

    res.json({ message: 'Class deactivated successfully' });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({ message: 'Server error deleting class' });
  }
};

const getAcademicYears = async (req, res) => {
  try {
    const years = await Class.findAll({
      attributes: ['academicYear'],
      group: ['academicYear'],
      order: [['academicYear', 'DESC']]
    });

    res.json({ academicYears: years.map(y => y.academicYear) });
  } catch (error) {
    console.error('Get academic years error:', error);
    res.status(500).json({ message: 'Server error fetching academic years' });
  }
};

module.exports = {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getAcademicYears
};
