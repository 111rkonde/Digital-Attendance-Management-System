const { User, Student, Class, Attendance, Subject } = require('../models');
const { Op, Sequelize } = require('sequelize');

const getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const startOfMonthStr = startOfMonth.toISOString().split('T')[0];

    // Get counts
    const totalStudents = await Student.count({ where: { isActive: true } });
    const totalTeachers = await User.count({ where: { role: 'teacher', isActive: true } });
    const totalClasses = await Class.count({ where: { isActive: true } });
    const totalSubjects = await Subject.count({ where: { isActive: true } });

    // Get today's attendance
    const todayAttendance = await Attendance.findAll({
      where: { date: today },
      attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      group: ['status']
    });

    const todayStats = {
      present: 0,
      absent: 0,
      late: 0,
      total: 0
    };

    todayAttendance.forEach(stat => {
      todayStats[stat.status] = parseInt(stat.get('count'));
      todayStats.total += parseInt(stat.get('count'));
    });

    // Get monthly attendance trend
    const monthlyAttendance = await Attendance.findAll({
      where: {
        date: {
          [Op.gte]: startOfMonthStr
        }
      },
      attributes: [
        'date',
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['date', 'status'],
      order: [['date', 'ASC']]
    });

    // Format monthly trend
    const trendMap = {};
    monthlyAttendance.forEach(record => {
      const date = record.date;
      if (!trendMap[date]) {
        trendMap[date] = { date, present: 0, absent: 0, late: 0, total: 0 };
      }
      trendMap[date][record.status] = parseInt(record.get('count'));
      trendMap[date].total += parseInt(record.get('count'));
    });

    // Get class-wise attendance for today
    const classAttendance = await Attendance.findAll({
      where: { date: today },
      include: [{
        model: Class,
        as: 'class',
        attributes: ['name', 'section']
      }],
      attributes: [
        'classId',
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('Attendance.id')), 'count']
      ],
      group: ['classId', 'class.name', 'class.section', 'status']
    });

    // Format class-wise data
    const classStats = {};
    classAttendance.forEach(record => {
      const classId = record.classId;
      if (!classStats[classId]) {
        classStats[classId] = {
          className: `${record.class.name} ${record.class.section}`,
          present: 0,
          absent: 0,
          late: 0,
          total: 0
        };
      }
      classStats[classId][record.status] = parseInt(record.get('count'));
      classStats[classId].total += parseInt(record.get('count'));
    });

    // Calculate percentages for class stats
    Object.values(classStats).forEach(stat => {
      stat.attendancePercentage = stat.total > 0 
        ? ((stat.present + stat.late) / stat.total * 100).toFixed(2)
        : 0;
    });

    res.json({
      summary: {
        totalStudents,
        totalTeachers,
        totalClasses,
        totalSubjects,
        todayAttendance: todayStats
      },
      monthlyTrend: Object.values(trendMap),
      classWiseAttendance: Object.values(classStats)
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard stats' });
  }
};

const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // Get teacher's assigned classes
    const { TeacherAssignment, Class } = require('../models');
    const assignments = await TeacherAssignment.findAll({
      where: { teacherId, isActive: true },
      include: [{
        model: Class,
        as: 'class'
      }]
    });

    const assignedClasses = assignments.map(a => ({
      id: a.class.id,
      name: a.class.name,
      section: a.class.section
    }));

    // Get unique classes
    const uniqueClasses = [];
    const seen = new Set();
    assignedClasses.forEach(c => {
      if (!seen.has(c.id)) {
        seen.add(c.id);
        uniqueClasses.push(c);
      }
    });

    // Get today's attendance for assigned classes
    const todayAttendance = await Attendance.findAll({
      where: {
        date: today,
        classId: { [Op.in]: uniqueClasses.map(c => c.id) }
      },
      attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      group: ['status']
    });

    const todayStats = { present: 0, absent: 0, late: 0, total: 0 };
    todayAttendance.forEach(stat => {
      todayStats[stat.status] = parseInt(stat.get('count'));
      todayStats.total += parseInt(stat.get('count'));
    });

    res.json({
      assignedClasses: uniqueClasses,
      todayStats
    });
  } catch (error) {
    console.error('Get teacher dashboard error:', error);
    res.status(500).json({ message: 'Server error fetching teacher dashboard' });
  }
};

const getStudentDashboard = async (req, res) => {
  try {
    const { Student, Attendance } = require('../models');
    const student = await Student.findOne({
      where: { userId: req.user.id },
      include: ['class']
    });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Get attendance summary
    const attendance = await Attendance.findAll({
      where: { studentId: student.id }
    });

    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const late = attendance.filter(a => a.status === 'late').length;
    const percentage = total > 0 ? ((present + late) / total * 100).toFixed(2) : 0;

    // Get recent attendance (last 7 days)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastWeekStr = lastWeek.toISOString().split('T')[0];

    const recentAttendance = await Attendance.findAll({
      where: {
        studentId: student.id,
        date: { [Op.gte]: lastWeekStr }
      },
      order: [['date', 'DESC']],
      include: ['subject']
    });

    res.json({
      student: {
        name: `${req.user.firstName} ${req.user.lastName}`,
        rollNumber: student.rollNumber,
        class: `${student.class.name} ${student.class.section}`
      },
      attendance: {
        total,
        present,
        absent,
        late,
        percentage
      },
      recentAttendance
    });
  } catch (error) {
    console.error('Get student dashboard error:', error);
    res.status(500).json({ message: 'Server error fetching student dashboard' });
  }
};

module.exports = {
  getDashboardStats,
  getTeacherDashboard,
  getStudentDashboard
};
