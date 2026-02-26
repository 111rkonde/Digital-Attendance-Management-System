import React, { useState, useEffect } from 'react';
import { FaClipboardCheck, FaPercentage, FaCalendarAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/student');
      setDashboardData(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const attendance = dashboardData?.attendance || { total: 0, present: 0, absent: 0, late: 0, percentage: 0 };
  const student = dashboardData?.student || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-500">Welcome back, {student.name}!</p>
      </div>

      {/* Student Info */}
      <div className="bg-primary-600 text-white rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-primary-100 text-sm mb-1">Name</p>
            <p className="text-xl font-bold">{student.name}</p>
          </div>
          <div>
            <p className="text-primary-100 text-sm mb-1">Roll Number</p>
            <p className="text-xl font-bold">{student.rollNumber}</p>
          </div>
          <div>
            <p className="text-primary-100 text-sm mb-1">Class</p>
            <p className="text-xl font-bold">{student.class}</p>
          </div>
        </div>
      </div>

      {/* Attendance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Attendance %</p>
              <p className={`text-3xl font-bold ${
                attendance.percentage >= 90 ? 'text-green-600' :
                attendance.percentage >= 75 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {attendance.percentage}%
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FaPercentage className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Total Days</p>
              <p className="text-3xl font-bold text-gray-900">{attendance.total}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <FaCalendarAlt className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Present</p>
              <p className="text-3xl font-bold text-green-600">{attendance.present}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FaClipboardCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Absent</p>
              <p className="text-3xl font-bold text-red-600">{attendance.absent}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <FaClipboardCheck className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/student/attendance"
          className="bg-white rounded-xl shadow-sm p-6 card-hover border border-gray-200"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <FaClipboardCheck className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">View Attendance</h3>
              <p className="text-sm text-gray-500">Check your detailed attendance records</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Attendance */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Attendance (Last 7 Days)</h2>
        {dashboardData?.recentAttendance?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Subject</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentAttendance.map((record, index) => (
                  <tr key={index}>
                    <td>{record.date}</td>
                    <td>{record.subject?.name || 'General'}</td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.status === 'present' ? 'bg-green-100 text-green-700' :
                        record.status === 'absent' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No recent attendance records
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
