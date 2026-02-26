const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'students',
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late'),
    allowNull: false
  },
  markedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isEdited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  editedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  editedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'attendance',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['studentId', 'classId', 'subjectId', 'date']
    }
  ]
});

module.exports = Attendance;
