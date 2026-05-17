import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, User, Search, Loader2, Delete, DeleteIcon, Trash2 } from 'lucide-react';
import AddStudentModal from '../components/AddStudentModal';
import { ChevronDown, ChevronUp, Edit2 } from 'lucide-react';

const StudentCard = ({ student, onUpdate, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(student);
  const [isSaving, setIsSaving] = useState(false);

  // Sync editData when student prop changes
  useEffect(() => {
    setEditData(student);
  }, [student]);

  const handleSave = async (e) => {
    if (e) e.stopPropagation();
    setIsSaving(true);
    try {
      const { _id, __v, createdAt, updatedAt, ...updatePayload } = editData;
      const res = await axios.put(`http://localhost:5000/api/students/${student._id}`, updatePayload);
      onUpdate(res.data);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating student:', err);
      alert('Failed to update student: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/students/${student._id}`);
      onDelete(student._id);
    } catch (err) {
      console.error('Error deleting student:', err);
      alert('Failed to delete student: ' + (err.response?.data?.message || err.message));
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200">
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between p-5 cursor-pointer hover:bg-gray-50/50"
        onClick={() => !isEditing && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-4 flex-1 w-full sm:w-auto">
          <div className="bg-indigo-50 p-3 rounded-full text-indigo-500 shrink-0">
            <User size={20} />
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-center">
            <div className="font-semibold text-gray-800 truncate">
              <span className="text-xs text-gray-400 block sm:hidden">Name</span>
              {student.name}
            </div>
            <div className="text-gray-600 text-sm truncate">
              <span className="text-xs text-gray-400 block sm:hidden">Class</span>
              <span className="hidden sm:inline text-gray-400 mr-1">Class:</span>{student.grade}
            </div>
            <div className="text-gray-600 text-sm truncate">
              <span className="text-xs text-gray-400 block sm:hidden">Board</span>
              <span className="hidden sm:inline text-gray-400 mr-1">Board:</span>{student.board || '-'}
            </div>
            <div className="text-gray-600 text-sm truncate">
              <span className="text-xs text-gray-400 block sm:hidden">School</span>
              {student.school}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end space-x-4 mt-3 sm:mt-0 w-full sm:w-auto">
          <span className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${student.status === 'enrolled' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
            {student.status === 'enrolled' ? 'Enrolled' : 'Past'}
          </span>
          <div className="text-gray-400 ml-2">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 border-t border-gray-50 bg-gray-50/30">
          {isEditing ? (
            <div className="space-y-4 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Name</label>
                  <input className="w-full border border-gray-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} placeholder="Name" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Class/Grade</label>
                  <input className="w-full border border-gray-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={editData.grade} onChange={e => setEditData({ ...editData, grade: e.target.value })} placeholder="Grade" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Board</label>
                  <select className="w-full border border-gray-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white" value={editData.board || ''} onChange={e => setEditData({ ...editData, board: e.target.value })}>
                    <option value="">Select Board</option>
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="State">State Board</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">School</label>
                  <input className="w-full border border-gray-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={editData.school} onChange={e => setEditData({ ...editData, school: e.target.value })} placeholder="School" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Email</label>
                  <input className="w-full border border-gray-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={editData.email || ''} onChange={e => setEditData({ ...editData, email: e.target.value })} placeholder="Email" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Batch</label>
                  <input className="w-full border border-gray-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={editData.batch || ''} onChange={e => setEditData({ ...editData, batch: e.target.value })} placeholder="Batch" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Parent's Name</label>
                  <input className="w-full border border-gray-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={editData.parentsName || ''} onChange={e => setEditData({ ...editData, parentsName: e.target.value })} placeholder="Parent's Name" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Parent's Phone</label>
                  <input className="w-full border border-gray-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={editData.parentsPhone || ''} onChange={e => setEditData({ ...editData, parentsPhone: e.target.value })} placeholder="Parent's Phone" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Status</label>
                  <select className="w-full border border-gray-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white" value={editData.status} onChange={e => setEditData({ ...editData, status: e.target.value })}>
                    <option value="enrolled">Enrolled</option>
                    <option value="past">Past</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Birth Date</label>
                  <input type="date" className="w-full border border-gray-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white" value={editData.birthDate ? new Date(editData.birthDate).toISOString().split('T')[0] : ''} onChange={e => setEditData({ ...editData, birthDate: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button onClick={(e) => { e.stopPropagation(); setIsEditing(false); setEditData(student); }} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center disabled:opacity-70">
                  {isSaving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Plus size={16} className="mr-2" />}
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="relative animate-fade-in-up">
              <button
                onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                className="absolute -top-2 right-0 p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Edit details"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(student._id); }}
                className="absolute top-10 right-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Student"
              >
                <Trash2 size={18} />
              </button>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 text-sm pr-10">
                <div><span className="block text-gray-400 text-xs mb-1">Full Name</span><span className="font-medium text-gray-800">{student.name}</span></div>
                <div><span className="block text-gray-400 text-xs mb-1">Grade/Class</span><span className="font-medium text-gray-800">{student.grade}</span></div>
                <div><span className="block text-gray-400 text-xs mb-1">Board</span><span className="font-medium text-gray-800">{student.board || '-'}</span></div>
                <div><span className="block text-gray-400 text-xs mb-1">School</span><span className="font-medium text-gray-800">{student.school}</span></div>
                <div><span className="block text-gray-400 text-xs mb-1">Email</span><span className="font-medium text-gray-800">{student.email || '-'}</span></div>
                <div><span className="block text-gray-400 text-xs mb-1">Batch</span><span className="font-medium text-gray-800">{student.batch || '-'}</span></div>
                <div><span className="block text-gray-400 text-xs mb-1">Parent's Name</span><span className="font-medium text-gray-800">{student.parentsName || '-'}</span></div>
                <div><span className="block text-gray-400 text-xs mb-1">Parent's Phone</span><span className="font-medium text-gray-800">{student.parentsPhone || '-'}</span></div>
                <div><span className="block text-gray-400 text-xs mb-1">Birth Date</span><span className="font-medium text-gray-800">{student.birthDate ? new Date(student.birthDate).toLocaleDateString() : '-'}</span></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStudents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/students');
      setStudents(res.data);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleStudentAdded = (newStudent) => {
    setStudents([newStudent, ...students]);
  };

  const handleStudentUpdated = (updatedStudent) => {
    setStudents(students.map(s => s._id === updatedStudent._id ? updatedStudent : s));
  };

  const handleStudentDeleted = (studentId) => {
    setStudents(students.filter(s => s._id !== studentId));
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.school.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const enrolledStudents = filteredStudents.filter(s => s.status === 'enrolled');
  const pastStudents = filteredStudents.filter(s => s.status === 'past');


  return (
    <>
      <div className="animate-fade-in-up pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Students</h1>

          <div className="flex space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-64 shadow-sm"
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium shadow-sm transition-colors"
            >
              <Plus size={18} />
              <span>Add Student</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64 text-indigo-500">
            <Loader2 className="animate-spin w-8 h-8" />
          </div>
        ) : (
          <div className="space-y-10">
            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <span className="bg-emerald-100 text-emerald-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">{enrolledStudents.length}</span>
                Currently Enrolled
              </h2>
              {enrolledStudents.length > 0 ? (
                <div className="flex flex-col space-y-4">
                  {enrolledStudents.map(student => (
                    <StudentCard key={student._id} student={student} onUpdate={handleStudentUpdated} onDelete={handleStudentDeleted} />
                  ))}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-500 shadow-sm">
                  No enrolled students found.
                </div>
              )}
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center mt-12">
                <span className="bg-gray-200 text-gray-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">{pastStudents.length}</span>
                Past Students
              </h2>
              {pastStudents.length > 0 ? (
                <div className="flex flex-col space-y-4">
                  {pastStudents.map(student => (
                    <StudentCard key={student._id} student={student} onUpdate={handleStudentUpdated} onDelete={handleStudentDeleted} />
                  ))}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-500 shadow-sm">
                  No past students found.
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      <AddStudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStudentAdded={handleStudentAdded}
      />
    </>
  );
};

export default Students;
