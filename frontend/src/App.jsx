import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Public Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Classes from './pages/admin/Classes';
import Subjects from './pages/admin/Subjects';
import Students from './pages/admin/Students';
import Teachers from './pages/admin/Teachers';
import Attendance from './pages/admin/Attendance';
import Reports from './pages/admin/Reports';

// Teacher Pages
import TeacherDashboard from './pages/teacher/Dashboard';
import MarkAttendance from './pages/teacher/MarkAttendance';
import TeacherStudents from './pages/teacher/Students';
import TeacherReports from './pages/teacher/Reports';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentAttendance from './pages/student/Attendance';

function App() {
  const { isAuthenticated, user } = useAuth();

  // Redirect to appropriate dashboard if already logged in
  const getDefaultRoute = () => {
    if (!isAuthenticated) return '/login';
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'teacher') return '/teacher/dashboard';
    return '/student/dashboard';
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to={getDefaultRoute()} /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to={getDefaultRoute()} /> : <Register />} 
      />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="classes" element={<Classes />} />
                <Route path="subjects" element={<Subjects />} />
                <Route path="students" element={<Students />} />
                <Route path="teachers" element={<Teachers />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="reports" element={<Reports />} />
                <Route path="*" element={<Navigate to="dashboard" />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Teacher Routes */}
      <Route
        path="/teacher/*"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <Layout>
              <Routes>
                <Route path="dashboard" element={<TeacherDashboard />} />
                <Route path="attendance" element={<MarkAttendance />} />
                <Route path="students" element={<TeacherStudents />} />
                <Route path="reports" element={<TeacherReports />} />
                <Route path="*" element={<Navigate to="dashboard" />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Student Routes */}
      <Route
        path="/student/*"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <Layout>
              <Routes>
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="attendance" element={<StudentAttendance />} />
                <Route path="*" element={<Navigate to="dashboard" />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route path="/" element={<Navigate to={getDefaultRoute()} />} />
      <Route path="*" element={<Navigate to={getDefaultRoute()} />} />
    </Routes>
  );
}

export default App;
