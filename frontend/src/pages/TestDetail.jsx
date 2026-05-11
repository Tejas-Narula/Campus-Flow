import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ChevronLeft, Users, CheckCircle, Clock, FileText, Settings, PenTool } from 'lucide-react';
import ManageTestStudentsModal from '../components/ManageTestStudentsModal';
import EnterMarksModal from '../components/EnterMarksModal';

const TestDetail = () => {
  const { id } = useParams();
  const { activeInstitution } = useContext(AuthContext);
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isManageStudentsModalOpen, setIsManageStudentsModalOpen] = useState(false);
  const [isEnterMarksModalOpen, setIsEnterMarksModalOpen] = useState(false);

  const fetchTest = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/tests/${id}`);
      setTest(response.data);
    } catch (error) {
      console.error('Failed to fetch test', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeInstitution && id) {
      fetchTest();
    }
  }, [activeInstitution, id]);

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/tests/${id}/status`, { status: newStatus });
      setTest({ ...test, status: response.data.status });
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  if (loading) return <div className="text-center py-12">Loading test details...</div>;
  if (!test) return <div className="text-center py-12 text-red-500">Test not found</div>;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-6">
        <button 
          onClick={() => navigate('/tests')}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to Tests
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{test.name}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <FileText size={16} className="mr-1.5" />
                Total Marks: {test.totalMarks}
              </span>
              <span className="flex items-center">
                <Users size={16} className="mr-1.5" />
                Students: {test.students.length}
              </span>
              <span className="flex items-center">
                <Clock size={16} className="mr-1.5" />
                Created: {new Date(test.date).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div>
            <select
              value={test.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`text-sm font-medium rounded-lg border-0 py-2 pl-3 pr-8 ring-1 ring-inset focus:ring-2 focus:ring-indigo-600 outline-none ${
                test.status === 'ongoing' ? 'bg-amber-50 text-amber-700 ring-amber-500/30' :
                test.status === 'finished' ? 'bg-green-50 text-green-700 ring-green-500/30' :
                'bg-gray-50 text-gray-700 ring-gray-500/30'
              }`}
            >
              <option value="not started">Not Started</option>
              <option value="ongoing">Ongoing</option>
              <option value="finished">Finished</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          {test.targetGrades.length > 0 && (
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md">Grades: {test.targetGrades.join(', ')}</span>
          )}
          {test.targetBoards.length > 0 && (
            <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-md">Boards: {test.targetBoards.join(', ')}</span>
          )}
          {test.targetSchools.length > 0 && (
            <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-md">Schools: {test.targetSchools.join(', ')}</span>
          )}
          {test.chapters && test.chapters.length > 0 && (
            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-md">Chapters: {test.chapters.join(', ')}</span>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Students & Marks</h2>
        <div className="flex space-x-3">
          <button 
            onClick={() => setIsManageStudentsModalOpen(true)}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Settings size={16} />
            <span>Manage Students</span>
          </button>
          <button 
            onClick={() => setIsEnterMarksModalOpen(true)}
            disabled={test.students.length === 0}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PenTool size={16} />
            <span>Enter Marks</span>
          </button>
        </div>
      </div>

      {test.students.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <Users size={32} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No students assigned</h3>
          <p className="text-gray-500 mb-6">Assign students to this test to start tracking their marks.</p>
          <button 
            onClick={() => setIsManageStudentsModalOpen(true)}
            className="text-indigo-600 font-medium hover:text-indigo-700"
          >
            Manage Test Students
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Grade & Board</th>
                <th className="px-6 py-4">School</th>
                <th className="px-6 py-4 text-right">Marks (out of {test.totalMarks})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {test.students.map(({ student, marksObtained }) => (
                <tr key={student._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{student.name}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{student.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    {student.grade} <span className="text-gray-400 mx-1">•</span> {student.board}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{student.school}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-semibold ${marksObtained !== null ? 'text-gray-900' : 'text-gray-400'}`}>
                      {marksObtained !== null ? marksObtained : '--'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isManageStudentsModalOpen && (
        <ManageTestStudentsModal 
          testId={id}
          test={test}
          onClose={() => setIsManageStudentsModalOpen(false)}
          onSuccess={() => {
            fetchTest();
            setIsManageStudentsModalOpen(false);
          }}
        />
      )}

      {isEnterMarksModalOpen && (
        <EnterMarksModal 
          testId={id}
          test={test}
          onClose={() => setIsEnterMarksModalOpen(false)}
          onSuccess={() => {
            fetchTest();
            setIsEnterMarksModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default TestDetail;
