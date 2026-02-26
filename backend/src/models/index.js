const { sequelize } = require('../config/database');

const User = require('./User');
const Class = require('./Class');
const Subject = require('./Subject');
const Student = require('./Student');
const Attendance = require('./Attendance');
const TeacherAssignment = require('./TeacherAssignment');

// Define associations
User.hasOne(Student, { foreignKey: 'userId', as: 'studentProfile' });
Student.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Class.hasMany(Student, { foreignKey: 'classId', as: 'students' });
Student.belongsTo(Class, { foreignKey: 'classId', as: 'class' });

User.hasMany(TeacherAssignment, { foreignKey: 'teacherId', as: 'assignments' });
TeacherAssignment.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });

Class.hasMany(TeacherAssignment, { foreignKey: 'classId', as: 'teacherAssignments' });
TeacherAssignment.belongsTo(Class, { foreignKey: 'classId', as: 'class' });

Subject.hasMany(TeacherAssignment, { foreignKey: 'subjectId', as: 'teacherAssignments' });
TeacherAssignment.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

Student.hasMany(Attendance, { foreignKey: 'studentId', as: 'attendance' });
Attendance.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

Class.hasMany(Attendance, { foreignKey: 'classId', as: 'attendance' });
Attendance.belongsTo(Class, { foreignKey: 'classId', as: 'class' });

Subject.hasMany(Attendance, { foreignKey: 'subjectId', as: 'attendance' });
Attendance.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

User.hasMany(Attendance, { foreignKey: 'markedBy', as: 'markedAttendance' });
Attendance.belongsTo(User, { foreignKey: 'markedBy', as: 'markedByUser' });

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing database:', error.message);
  }
};

module.exports = {
  sequelize,
  User,
  Class,
  Subject,
  Student,
  Attendance,
  TeacherAssignment,
  syncDatabase
};
