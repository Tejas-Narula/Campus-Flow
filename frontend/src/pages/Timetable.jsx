import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, Trash2 } from 'lucide-react';
import AddClassModal from '../components/AddClassModal';

const Timetable = () => {
  const { user, activeInstitution } = useContext(AuthContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Time slots to display (8 AM to 8 PM)
  const TIME_SLOTS = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  useEffect(() => {
    fetchClasses();
  }, [currentDate, activeInstitution]);

  const fetchClasses = async () => {
    if (!activeInstitution) return;
    
    setIsLoading(true);
    try {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      
      const res = await axios.get('/api/timetable', {
        params: {
          institution: activeInstitution,
          startDate: start.toISOString(),
          endDate: end.toISOString()
        },
        withCredentials: true
      });
      setClasses(res.data);
    } catch (error) {
      console.error('Error fetching timetable:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClass = async (classData) => {
    setIsAdding(true);
    try {
      await axios.post('/api/timetable', {
        ...classData,
        institution: activeInstitution
      }, { withCredentials: true });
      
      setIsAddModalOpen(false);
      fetchClasses();
    } catch (error) {
      console.error('Error adding class:', error);
      alert(error.response?.data?.message || 'Error adding class');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    try {
      await axios.delete(`/api/timetable/${id}`, { withCredentials: true });
      fetchClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Error deleting class');
    }
  };

  // Generate weeks for the current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const allDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weeks = [];
  let currentWeek = [];

  allDays.forEach(day => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const getClassesForDay = (date) => {
    return classes.filter(c => {
      const classDate = parseISO(c.date);
      return isSameDay(classDate, date);
    });
  };

  const calculateTopAndHeight = (startTime, endTime) => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const topMinutes = (startH - 8) * 60 + startM;
    const durationMinutes = ((endH - 8) * 60 + endM) - topMinutes;
    // 80px per hour => 80/60 px per minute
    return {
      top: `${topMinutes * (80 / 60)}px`,
      height: `${durationMinutes * (80 / 60)}px`
    };
  };

  if (!activeInstitution) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Please select an institution to view the timetable.
      </div>
    );
  }

  return (
    <>
      <div className="animate-fade-in-up pb-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Timetable</h1>
            <p className="text-gray-500 mt-1">Manage and view your monthly schedule</p>
          </div>
          
          {user?.role !== 'student' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-gradient px-5 py-2.5 rounded-xl text-sm font-medium flex items-center shadow-sm"
            >
              <Plus size={18} className="mr-2" />
              Add Class
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          {/* Calendar Header Controls */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <button 
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all text-gray-600 shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Calendar className="mr-2 text-indigo-500" size={20} />
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            
            <button 
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all text-gray-600 shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="p-6 space-y-8">
              {/* Render Each Week */}
              {weeks.map((week, weekIdx) => {
                const hasDaysInMonth = week.some(day => isSameMonth(day, currentDate));
                if (!hasDaysInMonth) return null;

                return (
                  <div key={weekIdx} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
                      <div className="p-3 text-center text-xs font-semibold text-gray-500 border-r border-gray-200 uppercase tracking-wider">
                        Time
                      </div>
                      {week.map((day, dayIdx) => (
                        <div 
                          key={dayIdx} 
                          className={`p-3 text-center border-r last:border-r-0 border-gray-200 ${
                            !isSameMonth(day, currentDate) ? 'opacity-40 bg-gray-100/50' : ''
                          } ${isSameDay(day, new Date()) ? 'bg-indigo-50/50 text-indigo-700' : ''}`}
                        >
                          <div className="text-xs font-semibold uppercase tracking-wider mb-1">{format(day, 'EEE')}</div>
                          <div className={`text-lg font-bold ${isSameDay(day, new Date()) ? 'text-indigo-600' : 'text-gray-900'}`}>
                            {format(day, 'd')}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="relative">
                      {/* Background Grid */}
                      <div className="divide-y divide-gray-100">
                        {TIME_SLOTS.map((time, timeIdx) => (
                          <div key={timeIdx} className="grid grid-cols-8 h-[80px]">
                            <div className="p-2 text-xs font-medium text-gray-500 border-r border-gray-200 flex items-start justify-center bg-gray-50/30">
                              {time}
                            </div>
                            {week.map((day, dayIdx) => (
                              <div 
                                key={dayIdx} 
                                className={`border-r last:border-r-0 border-gray-100 ${
                                  !isSameMonth(day, currentDate) ? 'bg-gray-50/50' : ''
                                }`}
                              ></div>
                            ))}
                          </div>
                        ))}
                      </div>

                      {/* Absolutely Positioned Classes */}
                      <div className="absolute inset-0 grid grid-cols-8 pointer-events-none">
                        <div className="border-r border-transparent"></div>
                        {week.map((day, dayIdx) => {
                          const dayClasses = getClassesForDay(day);
                          return (
                            <div key={dayIdx} className="relative pointer-events-none">
                              {dayClasses.map(cls => {
                                const { top, height } = calculateTopAndHeight(cls.startTime, cls.endTime);
                                return (
                                  <div 
                                    key={cls._id}
                                    className="absolute left-1 right-1 rounded-lg bg-indigo-50/90 border border-indigo-200 hover:border-indigo-400 transition-colors group p-2 shadow-sm pointer-events-auto overflow-hidden z-10"
                                    style={{ top, height }}
                                  >
                                    <div className="text-xs font-semibold text-indigo-900 leading-tight mb-1 truncate">{cls.title}</div>
                                    <div className="text-[10px] text-indigo-600 flex items-center mb-1">
                                      <Clock size={10} className="mr-1 shrink-0" />
                                      {cls.startTime} - {cls.endTime}
                                    </div>
                                    <div className="inline-block px-1.5 py-0.5 bg-indigo-100/80 text-indigo-700 text-[9px] font-bold rounded truncate max-w-full">
                                      {cls.batch}
                                    </div>
                                    
                                    {user?.role !== 'student' && (
                                      <button 
                                        onClick={() => handleDelete(cls._id)}
                                        className="absolute top-1 right-1 p-1 bg-white/80 backdrop-blur-sm rounded text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 shadow-sm transition-all"
                                        title="Delete class"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AddClassModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddClass}
        isAdding={isAdding}
      />
    </>
  );
};

export default Timetable;
