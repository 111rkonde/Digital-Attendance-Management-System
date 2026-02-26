import React, { useState, useEffect } from 'react';
import { FaSearch, FaUsers } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const TeacherStudents = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data.classes);
      if (response.data.classes.length > 0) {
        setSelectedClass(response.data.classes[0].id);
      }
    } catch (error) {
      toast.error('Failed to load classes');
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/students?classId=${selectedClass}`);
      setStudents(response.data.students);
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && students.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
        <div className="flex gap-3">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="form-input w-48"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} {cls.section}
              </option>
            ))}
          </select>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Parent Name</th>
                <th>Parent Phone</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td className="font-medium">{student.rollNumber}</td>
                  <td>{student.user.firstName} {student.user.lastName}</td>
                  <td>{student.user.email}</td>
                  <td>{student.user.phone || '-'}</td>
                  <td>{student.parentName || '-'}</td>
                  <td>{student.parentPhone || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredStudents.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {searchTerm ? 'No students found matching your search' : 'No students in this class'}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <FaUsers className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Students</p>
            <p className="text-2xl font-bold text-gray-900">{students.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherStudents;
