const express = require('express');
const router = express.Router();
const Test = require('../models/Test');
const Student = require('../models/Student');
const auth = require('../middleware/authMiddleware');

// Middleware to check for institution ID
const requireInstitution = (req, res, next) => {
  const institutionId = req.headers['x-institution-id'];
  if (!institutionId) {
    return res.status(400).json({ message: 'Institution ID is required' });
  }
  req.institutionId = institutionId;
  next();
};

// Get all tests for institution
router.get('/', auth, requireInstitution, async (req, res) => {
  try {
    const tests = await Test.find({ institution: req.institutionId }).sort({ date: -1 });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new test
router.post('/', auth, requireInstitution, async (req, res) => {
  const test = new Test({
    institution: req.institutionId,
    name: req.body.name,
    totalMarks: req.body.totalMarks,
    targetGrades: req.body.targetGrades || [],
    targetBoards: req.body.targetBoards || [],
    targetSchools: req.body.targetSchools || []
  });

  try {
    const newTest = await test.save();
    res.status(201).json(newTest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get a specific test
router.get('/:id', auth, requireInstitution, async (req, res) => {
  try {
    const test = await Test.findOne({ _id: req.params.id, institution: req.institutionId })
      .populate('students.student', 'name grade board school status phone');
    if (!test) return res.status(404).json({ message: 'Test not found' });
    res.json(test);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update test status
router.put('/:id/status', auth, requireInstitution, async (req, res) => {
  try {
    const test = await Test.findOneAndUpdate(
      { _id: req.params.id, institution: req.institutionId },
      { status: req.body.status },
      { new: true }
    );
    if (!test) return res.status(404).json({ message: 'Test not found' });
    res.json(test);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add individual student to test
router.post('/:id/students', auth, requireInstitution, async (req, res) => {
  try {
    const { studentId } = req.body;
    
    // check if student exists and belongs to institution
    const student = await Student.findOne({ _id: studentId, institution: req.institutionId });
    if (!student) return res.status(404).json({ message: 'Student not found in this institution' });

    const test = await Test.findOne({ _id: req.params.id, institution: req.institutionId });
    if (!test) return res.status(404).json({ message: 'Test not found' });

    // check if student already in test
    if (test.students.some(s => s.student.toString() === studentId)) {
      return res.status(400).json({ message: 'Student already in test' });
    }

    test.students.push({ student: studentId, marksObtained: null });
    await test.save();
    
    // return populated test
    const updatedTest = await Test.findById(test._id).populate('students.student', 'name grade board school status phone');
    res.json(updatedTest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add multiple students based on criteria
router.post('/:id/students/bulk', auth, requireInstitution, async (req, res) => {
  try {
    const test = await Test.findOne({ _id: req.params.id, institution: req.institutionId });
    if (!test) return res.status(404).json({ message: 'Test not found' });

    // build query matching test targets
    let query = { institution: req.institutionId, status: 'enrolled' };
    
    if (test.targetGrades && test.targetGrades.length > 0) {
      query.grade = { $in: test.targetGrades };
    }
    if (test.targetBoards && test.targetBoards.length > 0) {
      query.board = { $in: test.targetBoards };
    }
    if (test.targetSchools && test.targetSchools.length > 0) {
      query.school = { $in: test.targetSchools };
    }

    const matchingStudents = await Student.find(query);
    const currentStudentIds = test.students.map(s => s.student.toString());
    
    let addedCount = 0;
    matchingStudents.forEach(student => {
      if (!currentStudentIds.includes(student._id.toString())) {
        test.students.push({ student: student._id, marksObtained: null });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      await test.save();
    }
    
    const updatedTest = await Test.findById(test._id).populate('students.student', 'name grade board school status phone');
    res.json({ test: updatedTest, addedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Sync test students
router.put('/:id/students/sync', auth, requireInstitution, async (req, res) => {
  try {
    const { studentIds } = req.body;
    
    const test = await Test.findOne({ _id: req.params.id, institution: req.institutionId });
    if (!test) return res.status(404).json({ message: 'Test not found' });

    // Build a map of existing marks to preserve them
    const existingMarksMap = {};
    test.students.forEach(s => {
      existingMarksMap[s.student.toString()] = s.marksObtained;
    });

    // Create the new students array
    const newStudentsArray = studentIds.map(id => ({
      student: id,
      marksObtained: existingMarksMap[id] !== undefined ? existingMarksMap[id] : null
    }));

    test.students = newStudentsArray;
    await test.save();
    
    const updatedTest = await Test.findById(test._id).populate('students.student', 'name grade board school status phone');
    res.json(updatedTest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update student marks in bulk
router.put('/:id/marks/bulk', auth, requireInstitution, async (req, res) => {
  try {
    const { marksData } = req.body; // Array of { studentId, marksObtained }
    
    const test = await Test.findOne({ _id: req.params.id, institution: req.institutionId });
    if (!test) return res.status(404).json({ message: 'Test not found' });

    // Create a map from marksData for easy lookup
    const newMarksMap = {};
    marksData.forEach(m => {
      newMarksMap[m.studentId] = m.marksObtained;
    });

    // Update marks for matched students
    test.students.forEach(studentRecord => {
      const sId = studentRecord.student.toString();
      if (newMarksMap[sId] !== undefined) {
        studentRecord.marksObtained = newMarksMap[sId];
      }
    });

    await test.save();
    const updatedTest = await Test.findById(test._id).populate('students.student', 'name grade board school status phone');
    res.json(updatedTest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
