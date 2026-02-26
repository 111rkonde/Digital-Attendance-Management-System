import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { FaDownload, FaCalendarAlt } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const TeacherReports = () => {
  const [reportData, setReportData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    classId: '',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchClasses();
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
      setReportData(response.data.report);
    } catch (error) {
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const barData = {
    labels: reportData.map(r => r.date),
    datasets: [{
      label: 'Attendance %',
      data: reportData.map(r => r.attendancePercentage),
      backgroundColor: '#3b82f6',
      borderRadius: 4
    }]
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Attendance Reports</h1>
        <button className="btn-secondary flex items-center gap-2">
          <FaDownload /> Export
        </button>
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
              <option value="">Select Class</option>
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
            onClick={fetchReportData}
            className="btn-primary"
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Chart */}
      {reportData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Trend</h3>
          <div className="h-64">
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
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
              {reportData.map((record, index) => (
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
        
        {reportData.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            No data available. Select filters and generate report.
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherReports;
