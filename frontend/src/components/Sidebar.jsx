import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, Calendar, Settings, BookOpen, LogOut, Menu } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const { teacher, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/landing');
  };

  const navItems = [
    { path: '/', icon: <Home size={20} />, label: 'Dashboard' },
    { path: '/students', icon: <Users size={20} />, label: 'Students' },
    { path: '/timetable', icon: <Calendar size={20} />, label: 'Timetable' },
    { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <div className={`bg-white border-r border-gray-100 flex flex-col shadow-sm z-10 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
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
            title={teacher?.name}
          >
            {teacher?.name?.charAt(0) || 'T'}
          </div>
          <div 
            className={`overflow-hidden transition-all duration-300 ${
              isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-40 opacity-100 ml-3'
            }`}
          >
            <p className="text-sm font-medium text-gray-900 truncate">{teacher?.name}</p>
            <p className="text-xs text-gray-500 truncate">{teacher?.email}</p>
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
  );
};

export default Sidebar;
