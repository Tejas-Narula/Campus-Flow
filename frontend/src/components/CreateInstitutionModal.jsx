import React, { useState, useContext } from 'react';
import axios from 'axios';
import { X, Building2, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const CreateInstitutionModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({ name: '', details: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { fetchInstitutions, switchInstitution } = useContext(AuthContext);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/institutions', formData);
      await fetchInstitutions();
      switchInstitution(res.data._id); // Auto-switch to the new institution
      onClose();
      setFormData({ name: '', details: '' }); // reset
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create institution');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md m-4 relative z-[101] overflow-hidden transform transition-all">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
              <Building2 size={20} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">New Institution</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Institution Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Downtown Branch"
                className="w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50/50 focus:bg-white transition-colors"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Details (Optional)
              </label>
              <textarea
                placeholder="Address or any other details..."
                rows="3"
                className="w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50/50 focus:bg-white transition-colors resize-none"
                value={formData.details}
                onChange={e => setFormData({...formData, details: e.target.value})}
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center justify-center disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Institution
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInstitutionModal;
