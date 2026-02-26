import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaHome,
  FaUsers,
  FaGraduationCap,
  FaBook,
  FaClipboardCheck,
  FaChartBar,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUser
} from 'react-icons/fa';

const Layout = ({ children }) => {
  const { user, logout, isAdmin, isTeacher, isStudent } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getNavItems = () => {
    if (isAdmin) {
      return [
        { path: '/admin/dashboard', icon: FaHome, label: 'Dashboard' },
        { path: '/admin/classes', icon: FaGraduationCap, label: 'Classes' },
        { path: '/admin/subjects', icon: FaBook, label: 'Subjects' },
        { path: '/admin/students', icon: FaUsers, label: 'Students' },
        { path: '/admin/teachers', icon: FaUser, label: 'Teachers' },
        { path: '/admin/attendance', icon: FaClipboardCheck, label: 'Attendance' },
        { path: '/admin/reports', icon: FaChartBar, label: 'Reports' },
      ];
    } else if (isTeacher) {
      return [
        { path: '/teacher/dashboard', icon: FaHome, label: 'Dashboard' },
        { path: '/teacher/attendance', icon: FaClipboardCheck, label: 'Mark Attendance' },
        { path: '/teacher/students', icon: FaUsers, label: 'My Students' },
        { path: '/teacher/reports', icon: FaChartBar, label: 'Reports' },
      ];
    } else {
      return [
        { path: '/student/dashboard', icon: FaHome, label: 'Dashboard' },
        { path: '/student/attendance', icon: FaClipboardCheck, label: 'My Attendance' },
      ];
    }
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-center border-b border-gray-200">
            <h1 className="text-xl font-bold text-primary-600">Digital Attendance</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                        isActive
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Info & Logout */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <FaUser className="w-5 h-5 text-primary-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <FaSignOutAlt className="w-5 h-5 mr-3" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden h-16 bg-white shadow-sm flex items-center justify-between px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <FaBars className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-primary-600">Digital Attendance</h1>
          <div className="w-10" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
