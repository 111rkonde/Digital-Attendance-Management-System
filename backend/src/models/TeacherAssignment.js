const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TeacherAssignment = sequelize.define('TeacherAssignment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  teacherId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  classId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'classes',
      key: 'id'
    }
  },
  subjectId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'subjects',
      key: 'id'
    }
  },
  academicYear: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'teacher_assignments',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['teacherId', 'classId', 'subjectId', 'academicYear']
    }
  ]
});

module.exports = TeacherAssignment;
