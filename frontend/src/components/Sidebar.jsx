import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, Calendar, Settings, LogOut, Menu, ClipboardList, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = ({ isCollapsed, toggleSidebar, isMobileOpen, closeMobile }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    // Close mobile sidebar on navigation
    if (isMobileOpen) {
      closeMobile();
    }
  };

  let navItems = [
    { path: '/', icon: <Home size={20} />, label: 'Dashboard' },
    { path: '/tests', icon: <ClipboardList size={20} />, label: 'Tests' },
    { path: '/assignments', icon: <Calendar size={20} />, label: 'Assignments' },
    { path: '/timetable', icon: <Calendar size={20} />, label: 'Timetable' },
  ];

  if (user?.role !== 'student') {
    navItems.splice(1, 0, { path: '/students', icon: <Users size={20} />, label: 'Students' });
    navItems.push({ path: '/settings', icon: <Settings size={20} />, label: 'Settings' });
  }

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <div className={`
        bg-white border-r border-gray-100 flex flex-col shadow-sm z-50 transition-all duration-300
        ${/* Desktop: inline, controlled by isCollapsed */''}
        hidden md:flex
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}>
        <div className="p-4 flex items-center h-20">
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none shrink-0"
          >
            <Menu size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-2 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-xl transition-colors duration-200 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <div className="shrink-0 flex items-center justify-center">{item.icon}</div>
              <span 
                className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
                  isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-40 opacity-100 ml-3'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center px-2 mb-4">
            <div 
              className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0" 
              title={user?.name}
            >
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div 
              className={`overflow-hidden transition-all duration-300 ${
                isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-40 opacity-100 ml-3'
              }`}
            >
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || user?.phone}</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            title="Log out"
            className="w-full flex items-center px-2 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors overflow-hidden focus:outline-none"
          >
            <div className="shrink-0 flex items-center justify-center w-10">
              <LogOut size={20} />
            </div>
            <span 
              className={`whitespace-nowrap font-medium text-sm transition-all duration-300 ${
                isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-40 opacity-100 ml-3'
              }`}
            >
              Log out
            </span>
          </button>
        </div>
      </div>

      {/* Mobile sidebar — slides in from the left */}
      <div className={`
        fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-100 flex flex-col shadow-xl z-50 transition-transform duration-300 ease-in-out md:hidden
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 flex items-center justify-between h-20 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Campus Flow</h2>
          <button 
            onClick={closeMobile}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-xl transition-colors duration-200 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <div className="shrink-0 flex items-center justify-center">{item.icon}</div>
              <span className="ml-3">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center px-2 mb-4">
            <div 
              className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0" 
              title={user?.name}
            >
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || user?.phone}</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            title="Log out"
            className="w-full flex items-center px-2 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors focus:outline-none"
          >
            <div className="shrink-0 flex items-center justify-center w-10">
              <LogOut size={20} />
            </div>
            <span className="ml-3 font-medium text-sm">Log out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
