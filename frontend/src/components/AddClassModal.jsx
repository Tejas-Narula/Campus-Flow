import React, { useState, useEffect, useContext } from 'react';
import { X, Calendar as CalendarIcon, Clock, Users, Loader2 } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AddClassModal = ({ isOpen, onClose, onAdd, isAdding }) => {
  const [formData, setFormData] = useState({
    title: '',
    batch: '',
    startTime: '08:00',
    endTime: '09:00',
    recurrence: 'single', // 'single', 'everyday', 'custom'
    singleDate: new Date().toISOString().split('T')[0],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    selectedDays: [] // [0, 1, 2, 3, 4, 5, 6] where 0 is Sunday
  });

  const { activeInstitution } = useContext(AuthContext);
  const [batches, setBatches] = useState([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoadingBatches(true);
      axios.get('/api/students/metadata')
      .then(res => {
        setBatches(res.data.batches || []);
        if (res.data.batches?.length > 0 && !formData.batch) {
          setFormData(prev => ({ ...prev, batch: res.data.batches[0] }));
        }
      })
      .catch(err => console.error('Error fetching batches:', err))
      .finally(() => setIsLoadingBatches(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDayToggle = (dayIndex) => {
    setFormData(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(dayIndex)
        ? prev.selectedDays.filter(d => d !== dayIndex)
        : [...prev.selectedDays, dayIndex]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Generate dates based on recurrence
    const dates = [];
    
    if (formData.recurrence === 'single') {
      dates.push(formData.singleDate);
    } else {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (formData.recurrence === 'everyday') {
          dates.push(d.toISOString().split('T')[0]);
        } else if (formData.recurrence === 'custom' && formData.selectedDays.includes(d.getDay())) {
          dates.push(d.toISOString().split('T')[0]);
        }
      }
    }
    
    if (dates.length === 0) {
      alert("No dates selected based on your criteria.");
      return;
    }

    onAdd({
      title: formData.title,
      batch: formData.batch,
      startTime: formData.startTime,
      endTime: formData.endTime,
      dates
    });
  };

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]" 
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
          <h2 className="text-xl font-bold text-gray-800">Add New Class</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Class Title</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g. Mathematics 101"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Batch Name</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10 pointer-events-none" />
              <select
                required
                className="input-field pl-10 appearance-none bg-white cursor-pointer"
                value={formData.batch}
                onChange={e => setFormData({...formData, batch: e.target.value})}
              >
                <option value="" disabled>Select an existing batch...</option>
                {batches.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="time"
                  required
                  className="input-field pl-10"
                  value={formData.startTime}
                  onChange={e => setFormData({...formData, startTime: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="time"
                  required
                  className="input-field pl-10"
                  value={formData.endTime}
                  onChange={e => setFormData({...formData, endTime: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Schedule Type</label>
            <div className="flex gap-2">
              {[
                { id: 'single', label: 'Single Date' },
                { id: 'custom', label: 'Specific Days' },
                { id: 'everyday', label: 'Everyday' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFormData({...formData, recurrence: opt.id})}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors border ${
                    formData.recurrence === opt.id 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {formData.recurrence === 'single' ? (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  required
                  className="input-field pl-10"
                  value={formData.singleDate}
                  onChange={e => setFormData({...formData, singleDate: e.target.value})}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in-up">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    required
                    className="input-field"
                    value={formData.startDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    required
                    className="input-field"
                    value={formData.endDate}
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>
              
              {formData.recurrence === 'custom' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Days</label>
                  <div className="flex justify-between">
                    {DAYS.map((day, idx) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(idx)}
                        className={`w-10 h-10 rounded-full text-xs font-medium flex items-center justify-center transition-colors ${
                          formData.selectedDays.includes(idx)
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {day[0]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="pt-6 mt-4 border-t border-gray-100 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isAdding}
              className="flex-1 btn-gradient px-5 py-2.5 text-sm font-medium rounded-xl flex items-center justify-center disabled:opacity-70"
            >
              {isAdding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isAdding ? 'Adding...' : 'Add Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClassModal;
