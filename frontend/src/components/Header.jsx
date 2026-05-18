import React, { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Building2, ChevronDown, Plus, Menu } from 'lucide-react';
import CreateInstitutionModal from './CreateInstitutionModal';

const Header = ({ onMobileMenuToggle }) => {
  const { user, institutions, activeInstitution, switchInstitution } = useContext(AuthContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeInstName = institutions.find(i => i._id === activeInstitution)?.name || 'Select Institution';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-4 sm:px-8 z-10 shrink-0 shadow-sm relative">
      {/* Mobile hamburger button */}
      <button 
        onClick={onMobileMenuToggle}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none md:hidden"
      >
        <Menu size={24} />
      </button>

      {/* Spacer to push institution dropdown to the right on desktop */}
      <div className="hidden md:block" />

      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 py-2 px-3 sm:px-4 rounded-xl transition-colors"
        >
          <Building2 size={18} className="text-indigo-600 shrink-0" />
          <span className="font-medium text-sm text-gray-800 max-w-[120px] sm:max-w-xs truncate">
            {activeInstName}
          </span>
          <ChevronDown size={16} className={`text-gray-500 transition-transform shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50">
            <div className="py-1 max-h-60 overflow-y-auto">
              {institutions.map(inst => (
                <button
                  key={inst._id}
                  onClick={() => {
                    switchInstitution(inst._id);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm flex items-center space-x-2 hover:bg-gray-50 transition-colors ${
                    activeInstitution === inst._id ? 'bg-indigo-50/50 text-indigo-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  <Building2 size={16} className={activeInstitution === inst._id ? 'text-indigo-600' : 'text-gray-400'} />
                  <span className="truncate">{inst.name}</span>
                </button>
              ))}
            </div>
            {user?.role !== 'student' && (
              <div className="border-t border-gray-100 p-2">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus size={16} />
                  <span>Create New</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <CreateInstitutionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </header>
  );
};

export default Header;
