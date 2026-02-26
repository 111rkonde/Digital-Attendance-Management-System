import React, { useState, useEffect } from 'react';
import { FaUsers, FaGraduationCap, FaBook, FaClipboardCheck, FaCalendarCheck, FaUserClock } from 'react-icons/fa';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../../services/api';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard/admin');
      setStats(response.data);
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

  const summary = stats?.summary || {};

  const statCards = [
    { 
      title: 'Total Students', 
      value: summary.totalStudents || 0, 
      icon: FaUsers, 
      color: 'bg-blue-500',
      trend: '+12%'
    },
    { 
      title: 'Total Teachers', 
      value: summary.totalTeachers || 0, 
      icon: FaGraduationCap, 
      color: 'bg-green-500',
      trend: '+5%'
    },
    { 
      title: 'Total Classes', 
      value: summary.totalClasses || 0, 
      icon: FaBook, 
      color: 'bg-purple-500',
      trend: '+8%'
    },
    { 
      title: 'Total Subjects', 
      value: summary.totalSubjects || 0, 
      icon: FaClipboardCheck, 
      color: 'bg-orange-500',
      trend: '+3%'
    },
  ];

  // Today's attendance pie chart
  const todayAttendanceData = {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [
      {
        data: [
          summary.todayAttendance?.present || 0,
          summary.todayAttendance?.absent || 0,
          summary.todayAttendance?.late || 0
        ],
        backgroundColor: ['#22c55e', '#ef4444', '#eab308'],
        borderWidth: 0,
      },
    ],
  };

  // Monthly trend line chart
  const monthlyTrendData = {
    labels: stats?.monthlyTrend?.map(t => t.date) || [],
    datasets: [
      {
        label: 'Present',
        data: stats?.monthlyTrend?.map(t => t.present) || [],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Absent',
        data: stats?.monthlyTrend?.map(t => t.absent) || [],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Class-wise attendance bar chart
  const classWiseData = {
    labels: stats?.classWiseAttendance?.map(c => c.className) || [],
    datasets: [
      {
        label: 'Attendance %',
        data: stats?.classWiseAttendance?.map(c => c.attendancePercentage) || [],
        backgroundColor: '#3b82f6',
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">Welcome back, Administrator</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-500 font-medium">{card.trend}</span>
                <span className="text-gray-400 ml-2">from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Today's Attendance Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Today's Attendance</h2>
          <div className="flex items-center text-green-600">
            <FaCalendarCheck className="mr-2" />
            <span className="font-medium">
              {summary.todayAttendance?.total > 0 
                ? (((summary.todayAttendance.present + summary.todayAttendance.late) / summary.todayAttendance.total) * 100).toFixed(1)
                : 0}% Overall
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{summary.todayAttendance?.present || 0}</p>
            <p className="text-sm text-green-700">Present</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{summary.todayAttendance?.absent || 0}</p>
            <p className="text-sm text-red-700">Absent</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{summary.todayAttendance?.late || 0}</p>
            <p className="text-sm text-yellow-700">Late</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Attendance Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Distribution</h3>
          <div className="h-64">
            <Doughnut 
              data={todayAttendanceData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Attendance Trend</h3>
          <div className="h-64">
            <Line 
              data={monthlyTrendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Class-wise Attendance */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Class-wise Attendance</h3>
        <div className="h-64">
          <Bar 
            data={classWiseData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  ticks: {
                    callback: (value) => value + '%',
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
