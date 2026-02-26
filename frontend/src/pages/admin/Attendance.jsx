import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaSearch, FaDownload } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    classId: '',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (filters.classId) {
      fetchAttendance();
    }
  }, [filters]);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data.classes);
    } catch (error) {
      toast.error('Failed to load classes');
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await api.get('/attendance/report', {
        params: filters
      });
      setAttendance(response.data.report);
    } catch (error) {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReport = async (classId, date) => {
    try {
      await api.post('/attendance/send-report', null, {
        params: { classId, date }
      });
      toast.success('Report sent successfully');
    } catch (error) {
      toast.error('Failed to send report');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Attendance Records</h1>
        <button className="btn-secondary flex items-center gap-2">
          <FaDownload /> Export
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>
      </div>

      {/* Attendance Records */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Class</th>
                <th>Total Students</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Late</th>
                <th>Attendance %</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record, index) => (
                <tr key={index}>
                  <td>{record.date}</td>
                  <td className="font-medium">{record.className}</td>
                  <td>{record.totalStudents}</td>
                  <td className="text-green-600">{record.present}</td>
                  <td className="text-red-600">{record.absent}</td>
                  <td className="text-yellow-600">{record.late}</td>
                  <td>
                    <span className={`font-medium ${
                      record.attendancePercentage >= 90 ? 'text-green-600' :
                      record.attendancePercentage >= 75 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {record.attendancePercentage}%
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleSendReport(record.classId, record.date)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Send Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {attendance.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            No attendance records found for the selected filters
          </div>
        )}
        
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
