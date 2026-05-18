import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const AddStudentModal = ({ isOpen, onClose, onStudentAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    board: '',
    school: '',
    status: 'enrolled',
    email: '',
    batch: '',
    parentsName: '',
    parentsPhone: '',
    birthDate: ''
  });
  
  const [customFields, setCustomFields] = useState({
    grade: false,
    board: false,
    school: false,
    batch: false
  });

  const [metadata, setMetadata] = useState({ grades: [], boards: [], schools: [], batches: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fetchMetadata = async () => {
        try {
          const res = await axios.get('/api/students/metadata');
          setMetadata(res.data);
        } catch (err) {
          console.error('Failed to fetch metadata', err);
        }
      };
      fetchMetadata();
    } else {
      // Reset state when closed
      setFormData({
        name: '', grade: '', board: '', school: '', status: 'enrolled', 
        email: '', batch: '', parentsName: '', parentsPhone: '', birthDate: ''
      });
      setCustomFields({ grade: false, board: false, school: false, batch: false });
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Check if user selected "ADD_NEW"
    if (value === 'ADD_NEW') {
      setCustomFields({ ...customFields, [name]: true });
      setFormData({ ...formData, [name]: '' }); // clear it so they can type
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post('/api/students', formData);
      onStudentAdded(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  const renderDropdownOrInput = (field, label, options, required = false) => {
    const isCustom = customFields[field];
    
    if (isCustom) {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{label} {required && '*'}</label>
          <div className="flex">
            <input 
              required={required} 
              type="text" 
              name={field} 
              value={formData[field]} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
              placeholder={`Enter new ${label.toLowerCase()}`} 
              autoFocus
            />
            <button 
              type="button" 
              onClick={() => {
                setCustomFields({ ...customFields, [field]: false });
                setFormData({ ...formData, [field]: '' });
              }}
              className="px-3 bg-gray-100 border border-l-0 border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-r-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label} {required && '*'}</label>
        <select 
          required={required} 
          name={field} 
          value={formData[field]} 
          onChange={handleChange} 
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
        >
          <option value="">Select {label}</option>
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
          <option value="ADD_NEW" className="font-semibold text-indigo-600 bg-indigo-50">+ Add New...</option>
        </select>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Add New Student</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[80vh]">
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="John Doe" />
              </div>
              {renderDropdownOrInput('school', 'School', metadata.schools)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderDropdownOrInput('grade', 'Grade/Class', metadata.grades)}
              {renderDropdownOrInput('board', 'Board', metadata.boards)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-100 pb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Email *</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="student@example.com" />
              </div>
              {renderDropdownOrInput('batch', 'Batch', metadata.batches || [])}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white">
                  <option value="enrolled">Currently Enrolled</option>
                  <option value="past">Past Student</option>
                </select>
              </div>
            </div>

            <div className="pt-2 space-y-4">
              <h3 className="font-semibold text-gray-700">Additional Information (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent's Name</label>
                  <input type="text" name="parentsName" value={formData.parentsName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent's Phone</label>
                  <input type="tel" name="parentsPhone" value={formData.parentsPhone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="+1 987 654 321" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
                  <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                </div>
              </div>
            </div>
            
          </div>
          
          <div className="mt-8 flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-5 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-70 flex items-center">
              {loading ? 'Adding...' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;
