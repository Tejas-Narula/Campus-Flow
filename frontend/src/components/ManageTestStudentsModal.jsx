import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Search, CheckSquare, Square, Users } from 'lucide-react';

const ManageTestStudentsModal = ({ testId, test, onClose, onSuccess }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Set of student IDs currently checked
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchStudents();
    
    // Initialize selected students from test.students
    const initialSelected = new Set();
    test.students.forEach(s => {
      initialSelected.add(s.student._id || s.student);
    });
    setSelectedStudentIds(initialSelected);
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/students');
      // only show enrolled students
      setStudents(response.data.filter(s => s.status === 'enrolled'));
    } catch (error) {
      console.error('Failed to fetch students', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStudent = (studentId) => {
    setSelectedStudentIds(prev => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const handleSelectMatching = () => {
    setSelectedStudentIds(prev => {
      const next = new Set(prev);
      students.forEach(student => {
        // Check if student matches test target criteria
        const matchesGrade = test.targetGrades.length === 0 || test.targetGrades.includes(student.grade);
        const matchesBoard = test.targetBoards.length === 0 || test.targetBoards.includes(student.board);
        const matchesSchool = test.targetSchools.length === 0 || test.targetSchools.includes(student.school);
        
        if (matchesGrade && matchesBoard && matchesSchool) {
          next.add(student._id);
        }
      });
      return next;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.put(`http://localhost:5000/api/tests/${testId}/students/sync`, {
        studentIds: Array.from(selectedStudentIds)
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to sync students', error);
      alert('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Manage Students</h2>
            <p className="text-sm text-gray-500 mt-1">{test.name}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-indigo-50/30 gap-4">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <button
            onClick={handleSelectMatching}
            className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors flex items-center space-x-2 shrink-0"
          >
            <Users size={16} />
            <span>Select Matching Criteria</span>
          </button>
        </div>

        <div className="p-0 flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No students found.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredStudents.map(student => {
                const isSelected = selectedStudentIds.has(student._id);
                return (
                  <div 
                    key={student._id} 
                    onClick={() => handleToggleStudent(student._id)}
                    className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-indigo-50/20' : ''}`}
                  >
                    <div className="mr-4 text-indigo-600">
                      {isSelected ? <CheckSquare size={20} className="text-indigo-600" /> : <Square size={20} className="text-gray-300" />}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{student.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {student.grade} • {student.board} • {student.school}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
          <div className="text-sm text-gray-600 font-medium">
            {selectedStudentIds.size} students selected
          </div>
          <div className="flex space-x-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm disabled:opacity-70"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageTestStudentsModal;
