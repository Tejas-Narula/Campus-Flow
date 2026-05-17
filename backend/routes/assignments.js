const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Assignment = require('../models/Assignment');
const authMiddleware = require('../middleware/authMiddleware');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Setup multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.use(authMiddleware);

// Middleware to check for institution ID
const requireInstitution = (req, res, next) => {
  const institutionId = req.headers['x-institution-id'];
  if (!institutionId) {
    return res.status(400).json({ message: 'Institution ID is required' });
  }
  req.institutionId = institutionId;
  next();
};

// @route   GET /api/assignments
// @desc    Get assignments for an institution
router.get('/', requireInstitution, async (req, res) => {
  try {
    let query = { institution: req.institutionId };
    if (req.user && req.user.role === 'student') {
      const Student = require('../models/Student');
      const student = await Student.findOne({ email: req.user.email, institution: req.institutionId });
      if (student && student.batch) {
        query.$or = [{ batch: student.batch }, { batch: null }, { batch: '' }];
      } else {
        query.$or = [{ batch: null }, { batch: '' }];
      }
    }
    const assignments = await Assignment.find(query).sort({ createdAt: -1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/assignments
// @desc    Create an assignment with attachments
router.post('/', requireInstitution, upload.array('attachments', 5), async (req, res) => {
  try {
    if (req.user.role === 'student') {
      return res.status(403).json({ message: 'Students cannot create assignments' });
    }

    const { title, description, dueDate, batch } = req.body;
    const attachments = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const assignment = new Assignment({
      title,
      description,
      batch,
      institution: req.institutionId,
      teacher: req.user.id, // or req.teacher.id based on backward compatibility
      attachments,
      dueDate
    });

    const savedAssignment = await assignment.save();
    res.status(201).json(savedAssignment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
