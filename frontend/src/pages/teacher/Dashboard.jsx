import React, { useState, useEffect } from 'react';
import { FaClipboardCheck, FaUsers, FaCalendarAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const TeacherDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/teacher');
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

  const todayStats = dashboardData?.todayStats || { present: 0, absent: 0, late: 0, total: 0 };
  const assignedClasses = dashboardData?.assignedClasses || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's your overview.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/teacher/attendance"
          className="bg-primary-600 text-white rounded-xl p-6 card-hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm mb-1">Quick Action</p>
              <h3 className="text-xl font-bold">Mark Attendance</h3>
            </div>
            <FaClipboardCheck className="w-10 h-10 text-primary-200" />
          </div>
        </Link>

        <Link
          to="/teacher/students"
          className="bg-white rounded-xl p-6 shadow-sm card-hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">My Classes</p>
              <h3 className="text-xl font-bold text-gray-900">{assignedClasses.length}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FaUsers className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Link>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Today's Attendance</p>
              <h3 className="text-xl font-bold text-gray-900">
                {todayStats.total > 0 
                  ? ((todayStats.present + todayStats.late) / todayStats.total * 100).toFixed(1)
                  : 0}%
              </h3>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FaCalendarAlt className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Today's Attendance Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Attendance Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{todayStats.present}</p>
            <p className="text-sm text-green-700">Present</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-red-600">{todayStats.absent}</p>
            <p className="text-sm text-red-700">Absent</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">{todayStats.late}</p>
            <p className="text-sm text-yellow-700">Late</p>
          </div>
        </div>
      </div>

      {/* Assigned Classes */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Assigned Classes</h2>
        {assignedClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedClasses.map((cls) => (
              <Link
                key={cls.id}
                to={`/teacher/attendance?classId=${cls.id}`}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <FaUsers className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{cls.name} {cls.section}</h3>
                    <p className="text-sm text-gray-500">Click to mark attendance</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No classes assigned yet. Contact admin for class assignments.
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
