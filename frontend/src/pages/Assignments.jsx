import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Loader2, Plus, Paperclip, Calendar, X, FileText } from 'lucide-react';

const Assignments = () => {
  const { user, activeInstitution } = useContext(AuthContext);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', dueDate: '', batch: '' });
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    fetchAssignments();
    if (user?.role !== 'student') {
      fetchBatches();
    }
  }, [activeInstitution, user?.role]);

  const fetchBatches = async () => {
    if (!activeInstitution) return;
    try {
      const res = await axios.get('http://localhost:5000/api/students/metadata');
      if (res.data.batches) {
        setBatches(res.data.batches);
      }
    } catch (err) {
      console.error(err);
    }
  };


  const fetchAssignments = async () => {
    if (!activeInstitution) return;
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/assignments');
      setAssignments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) return;

    setSubmitting(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    if (formData.dueDate) data.append('dueDate', formData.dueDate);
    if (formData.batch) data.append('batch', formData.batch);
    files.forEach(file => {
      data.append('attachments', file);
    });

    try {
      const res = await axios.post('http://localhost:5000/api/assignments', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAssignments([res.data, ...assignments]);
      setShowCreateForm(false);
      setFormData({ title: '', description: '', dueDate: '', batch: '' });
      setFiles([]);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!activeInstitution) {
    return <div className="text-gray-500 italic mt-8 text-center">Please select an institution first.</div>;
  }

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Assignments</h1>
        {user?.role !== 'student' && !showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span className="font-medium">Create Assignment</span>
          </button>
        )}
      </div>

      {showCreateForm && user?.role !== 'student' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">New Assignment</h2>
            <button onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Algebra Homework Chapter 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                <select
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                >
                  <option value="">All Batches</option>
                  {batches.map(batch => (
                    <option key={batch} value={batch}>{batch}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question / Description</label>
              <textarea
                rows={4}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Write the questions or instructions here..."
              />
            </div>
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Attachments (Images/Docs)</label>
                <input
                  type="file"
                  multiple
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 outline-none"
                  onChange={handleFileChange}
                />
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-70 shadow-sm"
              >
                {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <span>Create</span>}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Assignments</h3>
          <p className="text-gray-500">
            {user?.role === 'student' ? 'You have no assignments at the moment.' : 'Create your first assignment for students.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {assignments.map((assignment) => (
            <div key={assignment._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-gray-800">
                  {assignment.title}
                  {assignment.batch && (
                    <span className="ml-3 text-xs font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-100 align-middle">
                      {assignment.batch}
                    </span>
                  )}
                </h3>
                {assignment.dueDate && (
                  <div className="flex items-center text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full">
                    <Calendar size={14} className="mr-1.5" />
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </div>
                )}
              </div>
              {assignment.description && (
                <p className="text-gray-600 mb-4 whitespace-pre-wrap">{assignment.description}</p>
              )}
              {assignment.attachments && assignment.attachments.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Attachments</h4>
                  <div className="flex flex-wrap gap-2">
                    {assignment.attachments.map((fileUrl, index) => {
                      const fileName = fileUrl.split('-').pop() || `Attachment ${index + 1}`;
                      return (
                        <a
                          key={index}
                          href={`http://localhost:5000${fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm text-indigo-600 font-medium transition-colors"
                        >
                          <Paperclip size={16} className="mr-2 text-gray-400" />
                          {fileName}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Assignments;
