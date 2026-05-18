const express = require('express');
const router = express.Router();
const TimetableEntry = require('../models/TimetableEntry');
const authMiddleware = require('../middleware/authMiddleware'); // Check auth middleware

// Get timetable entries
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate, institution } = req.query;
    if (!institution) {
      return res.status(400).json({ message: 'Institution ID is required' });
    }

    const query = { institution };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // If student, only return their batch
    if (req.user.role === 'student') {
      const Student = require('../models/Student');
      const student = await Student.findOne({ email: req.user.email, institution });
      if (!student || !student.batch) {
        return res.status(400).json({ message: 'Student batch not found for this institution' });
      }
      query.batch = student.batch;
    }

    const entries = await TimetableEntry.find(query).sort({ date: 1, startTime: 1 });
    res.json(entries);
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ message: 'Server error fetching timetable' });
  }
});

// Create multiple classes (for recurrence) or a single class
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers and admins can create classes' });
    }

    const { dates, title, startTime, endTime, batch, institution } = req.body;

    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ message: 'At least one date is required' });
    }

    const entriesToCreate = dates.map(dateStr => ({
      title,
      date: new Date(dateStr),
      startTime,
      endTime,
      batch,
      institution,
      teacher: req.user.id
    }));

    const createdEntries = await TimetableEntry.insertMany(entriesToCreate);
    res.status(201).json(createdEntries);
  } catch (error) {
    console.error('Error creating classes:', error);
    res.status(500).json({ message: 'Server error creating classes' });
  }
});

// Delete a single class
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers and admins can delete classes' });
    }

    const deleted = await TimetableEntry.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ message: 'Server error deleting class' });
  }
});

module.exports = router;
