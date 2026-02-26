const { Attendance, Student, User, Class, Subject } = require('../models');
const { Op } = require('sequelize');
const { sendAttendanceReport } = require('../config/email');

const getAttendanceByClassAndDate = async (req, res) => {
  try {
    const { classId, date } = req.params;
    const { subjectId } = req.query;

    const whereClause = {
      classId,
      date
    };

    if (subjectId) {
      whereClause.subjectId = subjectId;
    }

    const attendance = await Attendance.findAll({
      where: whereClause,
      include: [
        {
          model: Student,
          as: 'student',
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          }]
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['name', 'code']
        },
        {
          model: User,
          as: 'markedByUser',
          attributes: ['firstName', 'lastName']
        }
      ]
    });

    // Get all students in the class for marking
    const students = await Student.findAll({
      where: { classId, isActive: true },
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName', 'email']
      }],
      order: [['rollNumber', 'ASC']]
    });

    res.json({
      attendance,
      students,
      date,
      classId
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error fetching attendance' });
  }
};

const markAttendance = async (req, res) => {
  try {
    const { records, date, classId, subjectId } = req.body;
    const markedBy = req.user.id;

    const attendanceDate = date || new Date().toISOString().split('T')[0];

    const results = [];
    for (const record of records) {
      const { studentId, status, remarks } = record;

      // Check if attendance already exists
      const existingAttendance = await Attendance.findOne({
        where: {
          studentId,
          classId,
          subjectId: subjectId || null,
          date: attendanceDate
        }
      });

      if (existingAttendance) {
        // Update existing attendance
        await existingAttendance.update({
          status,
          remarks: remarks || existingAttendance.remarks,
          isEdited: true,
          editedBy: markedBy,
          editedAt: new Date()
        });
        results.push(existingAttendance);
      } else {
        // Create new attendance
        const attendance = await Attendance.create({
          studentId,
          classId,
          subjectId: subjectId || null,
          date: attendanceDate,
          status,
          remarks,
          markedBy
        });
        results.push(attendance);
      }
    }

    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance: results
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Server error marking attendance' });
  }
};

const bulkMarkAttendance = async (req, res) => {
  try {
    const { classId, date, status, subjectId, studentIds } = req.body;
    const markedBy = req.user.id;

    const attendanceDate = date || new Date().toISOString().split('T')[0];

    // Get all students in the class if studentIds not provided
    const targetStudentIds = studentIds || 
      (await Student.findAll({
        where: { classId, isActive: true },
        attributes: ['id']
      })).map(s => s.id);

    const results = [];
    for (const studentId of targetStudentIds) {
      const [attendance, created] = await Attendance.findOrCreate({
        where: {
          studentId,
          classId,
          subjectId: subjectId || null,
          date: attendanceDate
        },
        defaults: {
          status,
          markedBy
        }
      });

      if (!created) {
        await attendance.update({
          status,
          isEdited: true,
          editedBy: markedBy,
          editedAt: new Date()
        });
      }

      results.push(attendance);
    }

    res.status(201).json({
      message: 'Bulk attendance marked successfully',
      count: results.length
    });
  } catch (error) {
    console.error('Bulk mark attendance error:', error);
    res.status(500).json({ message: 'Server error marking bulk attendance' });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const editedBy = req.user.id;

    const attendance = await Attendance.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'student',
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          }]
        },
        {
          model: Class,
          as: 'class'
        }
      ]
    });

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    await attendance.update({
      status,
      remarks: remarks !== undefined ? remarks : attendance.remarks,
      isEdited: true,
      editedBy,
      editedAt: new Date()
    });

    res.json({
      message: 'Attendance updated successfully',
      attendance
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ message: 'Server error updating attendance' });
  }
};

const getAttendanceReport = async (req, res) => {
  try {
    const { classId, startDate, endDate } = req.query;

    const whereClause = {};
    if (classId) whereClause.classId = classId;
    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    const attendance = await Attendance.findAll({
      where: whereClause,
      include: [
        {
          model: Student,
          as: 'student',
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          }]
        },
        {
          model: Class,
          as: 'class'
        }
      ],
      order: [['date', 'DESC']]
    });

    // Group by date and class for summary
    const summary = {};
    attendance.forEach(record => {
      const key = `${record.date}_${record.classId}`;
      if (!summary[key]) {
        summary[key] = {
          date: record.date,
          className: `${record.class.name} ${record.class.section}`,
          totalStudents: 0,
          present: 0,
          absent: 0,
          late: 0,
          absentStudents: []
        };
      }
      summary[key].totalStudents++;
      summary[key][record.status]++;
      if (record.status === 'absent') {
        summary[key].absentStudents.push({
          name: `${record.student.user.firstName} ${record.student.user.lastName}`,
          rollNumber: record.student.rollNumber
        });
      }
    });

    // Calculate percentages
    Object.values(summary).forEach(s => {
      s.attendancePercentage = ((s.present + s.late) / s.totalStudents * 100).toFixed(2);
    });

    res.json({
      report: Object.values(summary),
      totalRecords: attendance.length
    });
  } catch (error) {
    console.error('Get attendance report error:', error);
    res.status(500).json({ message: 'Server error generating report' });
  }
};

const sendDailyReport = async (req, res) => {
  try {
    const { classId, date } = req.query;
    const reportDate = date || new Date().toISOString().split('T')[0];

    const attendance = await Attendance.findAll({
      where: {
        classId,
        date: reportDate
      },
      include: [
        {
          model: Student,
          as: 'student',
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          }]
        },
        {
          model: Class,
          as: 'class'
        }
      ]
    });

    if (attendance.length === 0) {
      return res.status(404).json({ message: 'No attendance records found for this date' });
    }

    const className = `${attendance[0].class.name} ${attendance[0].class.section}`;
    const totalStudents = attendance.length;
    const presentCount = attendance.filter(a => a.status === 'present').length;
    const absentCount = attendance.filter(a => a.status === 'absent').length;
    const lateCount = attendance.filter(a => a.status === 'late').length;
    const attendancePercentage = ((presentCount + lateCount) / totalStudents * 100).toFixed(2);

    const absentStudents = attendance
      .filter(a => a.status === 'absent')
      .map(a => ({
        name: `${a.student.user.firstName} ${a.student.user.lastName}`,
        rollNumber: a.student.rollNumber
      }));

    await sendAttendanceReport({
      date: reportDate,
      className,
      totalStudents,
      presentCount,
      absentCount,
      lateCount,
      absentStudents,
      attendancePercentage
    });

    res.json({ message: 'Daily report sent successfully' });
  } catch (error) {
    console.error('Send daily report error:', error);
    res.status(500).json({ message: 'Server error sending report' });
  }
};

module.exports = {
  getAttendanceByClassAndDate,
  markAttendance,
  bulkMarkAttendance,
  updateAttendance,
  getAttendanceReport,
  sendDailyReport
};
