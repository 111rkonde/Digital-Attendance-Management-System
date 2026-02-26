const { Subject, TeacherAssignment, User, Class } = require('../models');
const { Op } = require('sequelize');

const getAllSubjects = async (req, res) => {
  try {
    const { isActive } = req.query;
    const whereClause = {};
    
    if (isActive !== undefined) whereClause.isActive = isActive === 'true';

    const subjects = await Subject.findAll({
      where: whereClause,
      order: [['name', 'ASC']]
    });

    res.json({ subjects });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Server error fetching subjects' });
  }
};

const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const subject = await Subject.findByPk(id, {
      include: [{
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
            model: Class,
            as: 'class',
            attributes: ['id', 'name', 'section']
          }
        ]
      }]
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json({ subject });
  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({ message: 'Server error fetching subject' });
  }
};

const createSubject = async (req, res) => {
  try {
    const { name, code, description } = req.body;

    // Check if subject code already exists
    const existingSubject = await Subject.findOne({ where: { code } });
    if (existingSubject) {
      return res.status(400).json({ message: 'Subject with this code already exists' });
    }

    const subject = await Subject.create({
      name,
      code,
      description
    });

    res.status(201).json({
      message: 'Subject created successfully',
      subject
    });
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({ message: 'Server error creating subject' });
  }
};

const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, isActive } = req.body;

    const subject = await Subject.findByPk(id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Check for duplicate code
    if (code && code !== subject.code) {
      const existingSubject = await Subject.findOne({
        where: { code, id: { [Op.ne]: id } }
      });
      if (existingSubject) {
        return res.status(400).json({ message: 'Subject with this code already exists' });
      }
    }

    await subject.update({
      name: name || subject.name,
      code: code || subject.code,
      description: description !== undefined ? description : subject.description,
      isActive: isActive !== undefined ? isActive : subject.isActive
    });

    res.json({
      message: 'Subject updated successfully',
      subject
    });
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({ message: 'Server error updating subject' });
  }
};

const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findByPk(id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    await subject.update({ isActive: false });

    res.json({ message: 'Subject deactivated successfully' });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({ message: 'Server error deleting subject' });
  }
};

module.exports = {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject
};
