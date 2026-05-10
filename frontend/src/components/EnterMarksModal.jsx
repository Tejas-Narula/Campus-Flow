import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Search } from 'lucide-react';

const EnterMarksModal = ({ testId, test, onClose, onSuccess }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [marksState, setMarksState] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Initialize marks state from test.students
    const initialMarks = {};
    test.students.forEach(s => {
      // s.student could be populated object or just ID string depending on where it was fetched
      const sId = s.student._id || s.student;
      initialMarks[sId] = s.marksObtained !== null ? s.marksObtained : '';
    });
    setMarksState(initialMarks);
  }, [test]);

  const handleMarkChange = (studentId, value) => {
    setMarksState(prev => ({
      ...prev,
      [studentId]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Format marksData payload
    const marksData = Object.keys(marksState).map(studentId => {
      const val = marksState[studentId];
      return {
        studentId,
        marksObtained: val === '' ? null : Number(val)
      };
    });

    try {
      await axios.put(`http://localhost:5000/api/tests/${testId}/marks/bulk`, { marksData });
      onSuccess();
    } catch (error) {
      console.error('Failed to save bulk marks', error);
      alert('Failed to save marks');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredStudents = test.students.filter(s => {
    const name = s.student.name || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Enter Marks</h2>
            <p className="text-sm text-gray-500 mt-1">{test.name} • Total Marks: {test.totalMarks}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-100 bg-indigo-50/30">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="p-0 flex-1 overflow-y-auto">
          {test.students.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No students are assigned to this test yet.</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium sticky top-0 border-b border-gray-200 z-10">
                <tr>
                  <th className="px-6 py-3">Student Name</th>
                  <th className="px-6 py-3 text-right">Marks (out of {test.totalMarks})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map(s => {
                  const student = s.student;
                  const sId = student._id || student;
                  return (
                    <tr key={sId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-xs text-gray-500">{student.grade} • {student.board}</div>
                      </td>
                      <td className="px-6 py-3 text-right w-48">
                        <input
                          type="number"
                          min="0"
                          max={test.totalMarks}
                          value={marksState[sId] ?? ''}
                          onChange={(e) => handleMarkChange(sId, e.target.value)}
                          className="w-full text-right border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                          placeholder="--"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end space-x-3 shrink-0">
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
            {isSaving ? 'Saving...' : 'Save Marks'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnterMarksModal;
