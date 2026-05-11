import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Search, Plus } from 'lucide-react';

const CreateTestModal = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    totalMarks: '',
    targetGrades: [],
    targetBoards: [],
    targetSchools: [],
    chapters: []
  });

  const [availableChapters, setAvailableChapters] = useState([]);

  const [metadata, setMetadata] = useState({ grades: [], boards: [], schools: [] });
  
  const [customInputs, setCustomInputs] = useState({
    grade: { isOpen: false, value: '' },
    board: { isOpen: false, value: '' },
    school: { isOpen: false, value: '' },
    chapter: { isOpen: false, value: '' }
  });

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/students/metadata');
        setMetadata(res.data);
      } catch (err) {
        console.error('Failed to fetch metadata', err);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    const fetchChapters = async () => {
      if (formData.targetGrades.length > 0 && formData.targetBoards.length > 0) {
        try {
          const res = await axios.get(`http://localhost:5000/api/tests/metadata/chapters`, {
            params: {
              grades: formData.targetGrades.join(','),
              boards: formData.targetBoards.join(',')
            }
          });
          console.log('Fetched chapters:', res.data);
          setAvailableChapters(res.data);
        } catch (err) {
          console.error('Failed to fetch chapters', err);
        }
      } else {
        setAvailableChapters([]);
        // Clear selected chapters if grade/board is deselected
        setFormData(prev => ({ ...prev, chapters: [] }));
      }
    };
    fetchChapters();
  }, [formData.targetGrades, formData.targetBoards]);

  const handleArrayToggle = (field, value) => {
    setFormData(prev => {
      const array = prev[field];
      if (array.includes(value)) {
        return { ...prev, [field]: array.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...array, value] };
      }
    });
  };

  const handleAddCustom = (fieldKey, formDataKey) => {
    const value = customInputs[fieldKey].value.trim();
    if (value && !formData[formDataKey].includes(value)) {
      setFormData(prev => ({
        ...prev,
        [formDataKey]: [...prev[formDataKey], value]
      }));
    }
    setCustomInputs(prev => ({
      ...prev,
      [fieldKey]: { isOpen: false, value: '' }
    }));
  };

  const toggleCustomInput = (fieldKey) => {
    setCustomInputs(prev => ({
      ...prev,
      [fieldKey]: { ...prev[fieldKey], isOpen: true }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.totalMarks) return;
    
    // Auto-add any pending custom inputs before submitting
    let finalChapters = [...formData.chapters];
    if (customInputs.chapter.value.trim() && !finalChapters.includes(customInputs.chapter.value.trim())) {
      finalChapters.push(customInputs.chapter.value.trim());
    }

    let finalGrades = [...formData.targetGrades];
    if (customInputs.grade.value.trim() && !finalGrades.includes(customInputs.grade.value.trim())) {
      finalGrades.push(customInputs.grade.value.trim());
    }

    let finalBoards = [...formData.targetBoards];
    if (customInputs.board.value.trim() && !finalBoards.includes(customInputs.board.value.trim())) {
      finalBoards.push(customInputs.board.value.trim());
    }

    let finalSchools = [...formData.targetSchools];
    if (customInputs.school.value.trim() && !finalSchools.includes(customInputs.school.value.trim())) {
      finalSchools.push(customInputs.school.value.trim());
    }

    const finalData = {
      ...formData,
      chapters: finalChapters,
      targetGrades: finalGrades,
      targetBoards: finalBoards,
      targetSchools: finalSchools,
      totalMarks: Number(formData.totalMarks)
    };

    console.log('Creating test with data:', finalData);
    onCreate(finalData);
  };

  // Helper to render pill sections
  const renderPillSection = (title, metaArray, formDataKey, customKey) => {
    // Combine fetched metadata with newly added custom ones
    const combinedOptions = [...new Set([...metaArray, ...formData[formDataKey]])];
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{title}</label>
        <div className="flex flex-wrap gap-2 items-center">
          {combinedOptions.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => handleArrayToggle(formDataKey, option)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                formData[formDataKey].includes(option)
                  ? 'bg-indigo-100 text-indigo-700 ring-1 ring-inset ring-indigo-600/20'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 ring-1 ring-inset ring-gray-200'
              }`}
            >
              {option}
            </button>
          ))}
          
          {customInputs[customKey].isOpen ? (
            <div className="flex items-center">
              <input
                type="text"
                autoFocus
                className="w-32 border border-gray-300 px-2 py-1.5 rounded-l-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                placeholder="Type here..."
                value={customInputs[customKey].value}
                onChange={e => setCustomInputs(prev => ({ ...prev, [customKey]: { ...prev[customKey], value: e.target.value } }))}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustom(customKey, formDataKey);
                  } else if (e.key === 'Escape') {
                    setCustomInputs(prev => ({ ...prev, [customKey]: { isOpen: false, value: '' } }));
                  }
                }}
              />
              <button 
                type="button"
                onClick={() => handleAddCustom(customKey, formDataKey)}
                className="bg-indigo-600 text-white px-2 py-1.5 rounded-r-lg text-sm font-medium hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => toggleCustomInput(customKey)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-dashed border-gray-300 transition-colors flex items-center"
            >
              <Plus size={14} className="mr-1" />
              Add Custom
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Create New Test</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Test Name *</label>
              <input
                type="text"
                required
                className="w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50/50 focus:bg-white transition-colors"
                placeholder="e.g. Midterm Mathematics"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Total Marks *</label>
              <input
                type="number"
                required
                min="1"
                className="w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50/50 focus:bg-white transition-colors"
                placeholder="e.g. 100"
                value={formData.totalMarks}
                onChange={e => setFormData({...formData, totalMarks: e.target.value})}
              />
            </div>
          </div>

          {renderPillSection('Target Grades', metadata.grades, 'targetGrades', 'grade')}
          {renderPillSection('Target Boards', metadata.boards, 'targetBoards', 'board')}
          
          {formData.targetGrades.length > 0 && formData.targetBoards.length > 0 && (
            renderPillSection('Chapters', availableChapters, 'chapters', 'chapter')
          )}

          {renderPillSection('Target Schools', metadata.schools, 'targetSchools', 'school')}
          
        </form>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end space-x-3 shrink-0">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
          >
            Create Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTestModal;
