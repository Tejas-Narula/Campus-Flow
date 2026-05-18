import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, ClipboardList, Clock, CheckCircle } from 'lucide-react';
import CreateTestModal from '../components/CreateTestModal';

const Tests = () => {
  const { activeInstitution } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTests = async () => {
    try {
      const response = await axios.get('/api/tests');
      setTests(response.data);
    } catch (error) {
      console.error('Failed to fetch tests', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeInstitution) {
      fetchTests();
    }
  }, [activeInstitution]);

  const { user } = useContext(AuthContext);
  const currentStudentProfile = user?.allProfiles?.find(p => p.institution?._id === activeInstitution || p.institution === activeInstitution);
  const displayTests = user?.role === 'student' && currentStudentProfile 
    ? tests.filter(t => t.students?.some(s => s.student.toString() === currentStudentProfile._id))
    : tests;

  const handleCreateTest = async (testData) => {
    try {
      const response = await axios.post('/api/tests', testData);
      setTests([response.data, ...tests]);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create test', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ongoing': return <Clock className="text-amber-500 w-5 h-5" />;
      case 'finished': return <CheckCircle className="text-green-500 w-5 h-5" />;
      default: return <ClipboardList className="text-gray-400 w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ongoing': return 'bg-amber-50 text-amber-700 ring-amber-500/20';
      case 'finished': return 'bg-green-50 text-green-700 ring-green-500/20';
      default: return 'bg-gray-50 text-gray-700 ring-gray-500/20';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Tests</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and track student assessments</p>
        </div>
        {user?.role !== 'student' && (
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto"
          >
            <Plus size={18} />
            <span>Create Test</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading tests...</div>
      ) : displayTests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
            <ClipboardList size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No tests to show</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            {user?.role === 'student' ? "You aren't enrolled in any tests yet." : "Start evaluating your students by creating your first test."}
          </p>
          {user?.role !== 'student' && (
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="text-indigo-600 font-medium hover:text-indigo-700"
            >
              Create your first test
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayTests.map(test => (
            <div 
              key={test._id} 
              onClick={() => navigate(`/tests/${test._id}`)}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600 group-hover:scale-110 transition-transform">
                    {getStatusIcon(test.status)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 line-clamp-1" title={test.name}>{test.name}</h3>
                    <p className="text-xs text-gray-500">{new Date(test.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="mb-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ring-1 ring-inset ${getStatusColor(test.status)}`}>
                    {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Marks:</span>
                    <span className="font-medium text-gray-900">{test.totalMarks}</span>
                  </div>
                  {test.chapters && test.chapters.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Chapters:</span>
                      <span className="font-medium text-gray-900 line-clamp-1 text-right ml-4" title={test.chapters.join(', ')}>
                        {test.chapters.join(', ')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Students:</span>
                    <span className="font-medium text-gray-900">{test.students?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isCreateModalOpen && (
        <CreateTestModal 
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateTest}
        />
      )}
    </div>
  );
};

export default Tests;
