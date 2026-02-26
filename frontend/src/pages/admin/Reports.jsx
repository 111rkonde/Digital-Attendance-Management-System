import React, { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { FaDownload, FaEnvelope } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    classId: '',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchClasses();
    fetchReportData();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data.classes);
    } catch (error) {
      toast.error('Failed to load classes');
    }
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/attendance/report', { params: filters });
      setReportData(response.data);
    } catch (error) {
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    fetchReportData();
  };

  // Calculate summary statistics
  const calculateStats = () => {
    if (!reportData?.report) return null;
    
    const reports = reportData.report;
    const totalRecords = reports.length;
    const avgAttendance = reports.reduce((sum, r) => sum + parseFloat(r.attendancePercentage), 0) / totalRecords;
    const totalPresent = reports.reduce((sum, r) => sum + r.present, 0);
    const totalAbsent = reports.reduce((sum, r) => sum + r.absent, 0);
    const totalLate = reports.reduce((sum, r) => sum + r.late, 0);
    
    return { totalRecords, avgAttendance, totalPresent, totalAbsent, totalLate };
  };

  const stats = calculateStats();

  const pieData = stats ? {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [{
      data: [stats.totalPresent, stats.totalAbsent, stats.totalLate],
      backgroundColor: ['#22c55e', '#ef4444', '#eab308'],
      borderWidth: 0
    }]
  } : null;

  const barData = reportData ? {
    labels: reportData.report?.map(r => r.className) || [],
    datasets: [{
      label: 'Attendance %',
      data: reportData.report?.map(r => r.attendancePercentage) || [],
      backgroundColor: '#3b82f6',
      borderRadius: 4
    }]
  } : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Attendance Reports</h1>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <FaDownload /> Export PDF
          </button>
          <button className="btn-primary flex items-center gap-2">
            <FaEnvelope /> Email Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="form-label">Class</label>
            <select
              value={filters.classId}
              onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
              className="form-input"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} {cls.section}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="form-input"
            />
          </div>
          <button
            onClick={handleApplyFilters}
            className="btn-primary"
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Summary Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-500 mb-1">Average Attendance</p>
            <p className="text-3xl font-bold text-primary-600">{stats.avgAttendance.toFixed(1)}%</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-500 mb-1">Total Present</p>
            <p className="text-3xl font-bold text-green-600">{stats.totalPresent}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-500 mb-1">Total Absent</p>
            <p className="text-3xl font-bold text-red-600">{stats.totalAbsent}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-500 mb-1">Total Late</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.totalLate}</p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Distribution</h3>
          <div className="h-64">
            {pieData && (
              <Pie 
                data={pieData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom' }
                  }
                }}
              />
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Class-wise Attendance</h3>
          <div className="h-64">
            {barData && (
              <Bar 
                data={barData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, max: 100 }
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Detailed Report</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Class</th>
                <th>Total</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Late</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {reportData?.report?.map((record, index) => (
                <tr key={index}>
                  <td>{record.date}</td>
                  <td className="font-medium">{record.className}</td>
                  <td>{record.totalStudents}</td>
                  <td className="text-green-600">{record.present}</td>
                  <td className="text-red-600">{record.absent}</td>
                  <td className="text-yellow-600">{record.late}</td>
                  <td className="font-medium">{record.attendancePercentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {(!reportData?.report || reportData.report.length === 0) && (
          <div className="text-center py-12 text-gray-500">
            No data available for the selected filters
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
