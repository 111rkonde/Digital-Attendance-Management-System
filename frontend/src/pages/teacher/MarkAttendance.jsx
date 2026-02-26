import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { FaCheck, FaTimes, FaClock, FaSave, FaCalendarAlt } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MarkAttendance = () => {
  const [searchParams] = useSearchParams();
  const classId = searchParams.get('classId');
  
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(classId || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      fetchAttendance();
    }
  }, [selectedClass, selectedDate]);

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
      const response = await api.get(`/attendance/class/${selectedClass}/${selectedDate}`);
      setStudents(response.data.students);
      
      // Initialize attendance state
      const initialAttendance = {};
      response.data.students.forEach(student => {
        const existingRecord = response.data.attendance.find(
          a => a.studentId === student.id
        );
        initialAttendance[student.id] = existingRecord?.status || '';
      });
      setAttendance(initialAttendance);
    } catch (error) {
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleMarkAll = (status) => {
    const newAttendance = {};
    students.forEach(student => {
      newAttendance[student.id] = status;
    });
    setAttendance(newAttendance);
    toast.success(`Marked all as ${status}`);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = Object.entries(attendance)
        .filter(([_, status]) => status)
        .map(([studentId, status]) => ({
          studentId,
          status
        }));

      if (records.length === 0) {
        toast.error('Please mark attendance for at least one student');
        return;
      }

      await api.post('/attendance/mark', {
        records,
        classId: selectedClass,
        date: selectedDate
      });

      toast.success('Attendance saved successfully');
    } catch (error) {
      toast.error('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const getStatusButtonClass = (studentId, status) => {
    const currentStatus = attendance[studentId];
    const baseClass = 'px-3 py-1 rounded-lg font-medium text-sm transition-all duration-200 ';
    
    if (currentStatus === status) {
      switch (status) {
        case 'present':
          return baseClass + 'bg-green-500 text-white';
        case 'absent':
          return baseClass + 'bg-red-500 text-white';
        case 'late':
          return baseClass + 'bg-yellow-500 text-white';
        default:
          return baseClass + 'bg-gray-200 text-gray-700';
      }
    }
    return baseClass + 'bg-gray-100 text-gray-600 hover:bg-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
        <button
          onClick={handleSave}
          disabled={saving || !selectedClass}
          className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <FaSave />
          {saving ? 'Saving...' : 'Save Attendance'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="form-input"
            >
              <option value="">Choose a class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} {cls.section} ({cls.academicYear})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Date</label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedClass && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 mr-2">Mark all as:</span>
            <button
              onClick={() => handleMarkAll('present')}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200"
            >
              Present
            </button>
            <button
              onClick={() => handleMarkAll('absent')}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"
            >
              Absent
            </button>
            <button
              onClick={() => handleMarkAll('late')}
              className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200"
            >
              Late
            </button>
          </div>
        </div>
      )}

      {/* Students List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : selectedClass ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th className="text-center">Present</th>
                  <th className="text-center">Absent</th>
                  <th className="text-center">Late</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="font-medium">{student.rollNumber}</td>
                    <td>
                      {student.user.firstName} {student.user.lastName}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => handleStatusChange(student.id, 'present')}
                        className={getStatusButtonClass(student.id, 'present')}
                      >
                        <FaCheck className="inline mr-1" /> Present
                      </button>
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => handleStatusChange(student.id, 'absent')}
                        className={getStatusButtonClass(student.id, 'absent')}
                      >
                        <FaTimes className="inline mr-1" /> Absent
                      </button>
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => handleStatusChange(student.id, 'late')}
                        className={getStatusButtonClass(student.id, 'late')}
                      >
                        <FaClock className="inline mr-1" /> Late
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {students.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No students found in this class
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500">Please select a class to mark attendance</p>
        </div>
      )}
    </div>
  );
};

export default MarkAttendance;
