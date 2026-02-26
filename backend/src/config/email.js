const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, html, text) => {
  try {
    const msg = {
      to,
      from: process.env.EMAIL_FROM,
      subject,
      text: text || '',
      html: html || '',
    };

    await sgMail.send(msg);
    console.log(`Email sent successfully to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error.message);
    return { success: false, error: error.message };
  }
};

const sendAttendanceReport = async (reportData) => {
  const { date, className, totalStudents, presentCount, absentCount, lateCount, absentStudents, attendancePercentage } = reportData;
  
  const principalEmails = process.env.PRINCIPAL_EMAILS ? process.env.PRINCIPAL_EMAILS.split(',') : [];
  
  if (principalEmails.length === 0) {
    console.warn('No principal email addresses configured');
    return;
  }

  const absentStudentsList = absentStudents.length > 0 
    ? absentStudents.map(s => `<li>${s.name} (Roll: ${s.rollNumber})</li>`).join('')
    : '<li>No absent students</li>';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Daily Attendance Report</h2>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Class:</strong> ${className}</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Attendance Summary</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Total Students:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${totalStudents}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Present:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; color: #16a34a;">${presentCount}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Absent:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; color: #dc2626;">${absentCount}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Late:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; color: #ca8a04;">${lateCount}</td>
          </tr>
          <tr style="background: #e5e7eb;">
            <td style="padding: 8px;"><strong>Attendance %:</strong></td>
            <td style="padding: 8px; font-size: 18px; font-weight: bold; color: #2563eb;">${attendancePercentage}%</td>
          </tr>
        </table>
      </div>

      <div style="margin: 20px 0;">
        <h3>Absent Students</h3>
        <ul style="background: #fef2f2; padding: 15px 30px; border-radius: 8px; border-left: 4px solid #dc2626;">
          ${absentStudentsList}
        </ul>
      </div>

      <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
        This is an automated report from the Digital Attendance Management System.
      </p>
    </div>
  `;

  const subject = `Attendance Report - ${className} - ${date}`;
  
  for (const email of principalEmails) {
    await sendEmail(email.trim(), subject, html);
  }
};

module.exports = { sendEmail, sendAttendanceReport };
