const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Test = require('../models/Test');
const authMiddleware = require('../middleware/authMiddleware');

// Require auth for all student routes
router.use(authMiddleware);

// Middleware to check for institution ID
const requireInstitution = (req, res, next) => {
  const institutionId = req.headers['x-institution-id'];
  if (!institutionId) {
    return res.status(400).json({ message: 'Institution ID is required in headers' });
  }
  req.institutionId = institutionId;
  next();
};

// Get all students for the active institution
router.get('/', requireInstitution, async (req, res) => {
  try {
    const students = await Student.find({ institution: req.institutionId }).sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new student to the active institution
router.post('/', requireInstitution, async (req, res) => {
  const student = new Student({
    name: req.body.name,
    grade: req.body.grade,
    board: req.body.board,
    school: req.body.school,
    status: req.body.status || 'enrolled',
    phone: req.body.phone,
    parentsName: req.body.parentsName,
    parentsPhone: req.body.parentsPhone,
    birthDate: req.body.birthDate,
    institution: req.institutionId
  });

  try {
    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// Get unique metadata (grades, boards, schools) for active institution
router.get('/metadata', requireInstitution, async (req, res) => {
  try {
    const grades = await Student.distinct('grade', { institution: req.institutionId });
    const boards = await Student.distinct('board', { institution: req.institutionId, board: { $ne: null, $ne: '' } });
    const schools = await Student.distinct('school', { institution: req.institutionId });
    res.json({ grades, boards, schools });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', requireInstitution, async (req, res) => {
  try {
    const deletedStudent = await Student.findOneAndDelete({ _id: req.params.id, institution: req.institutionId });
    if (!deletedStudent) {
      return res.status(404).json({ message: 'Student not found in this institution' });
    }

    // Remove the student from all tests within the institution
    await Test.updateMany(
      { institution: req.institutionId },
      { $pull: { students: { student: req.params.id } } }
    );

    res.json(deletedStudent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a student (making sure it belongs to the active institution)
router.put('/:id', requireInstitution, async (req, res) => {
  try {
    const updatedStudent = await Student.findOneAndUpdate(
      { _id: req.params.id, institution: req.institutionId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found in this institution' });
    }
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
