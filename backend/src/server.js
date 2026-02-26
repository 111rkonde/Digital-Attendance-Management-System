const app = require('./app');
const cron = require('node-cron');
const { Attendance, Class, Student, User } = require('./models');
const { sendAttendanceReport } = require('./config/email');
const { Op } = require('sequelize');

const PORT = process.env.PORT || 5000;

// Scheduled job to send daily attendance reports at 6 PM
const scheduleDailyReports = () => {
  // Run at 6:00 PM every day
  cron.schedule('0 18 * * *', async () => {
    console.log('Running scheduled daily report generation...');
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get all classes with attendance today
      const classes = await Class.findAll({ where: { isActive: true } });
      
      for (const classData of classes) {
        const attendance = await Attendance.findAll({
          where: {
            classId: classData.id,
            date: today
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
            }
          ]
        });

        if (attendance.length === 0) continue;

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
          date: today,
          className: `${classData.name} ${classData.section}`,
          totalStudents,
          presentCount,
          absentCount,
          lateCount,
          absentStudents,
          attendancePercentage
        });
      }
      
      console.log('Daily reports sent successfully');
    } catch (error) {
      console.error('Error sending daily reports:', error);
    }
  });

  console.log('Daily report scheduler initialized (runs at 6:00 PM)');
};

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Initialize scheduled jobs
  scheduleDailyReports();
});
