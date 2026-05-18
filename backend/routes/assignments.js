const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Assignment = require('../models/Assignment');
const authMiddleware = require('../middleware/authMiddleware');

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase if credentials are provided in env
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
}

// Setup multer memory storage (stores file buffers in RAM temporarily)
const upload = multer({ storage: multer.memoryStorage() });

// File upload handler supporting Supabase storage with a local disk fallback
const handleFileUpload = async (file) => {
  if (supabase) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = uniqueSuffix + path.extname(file.originalname);
    
    const { data, error } = await supabase.storage
      .from('assignments') // The bucket name on Supabase
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error details:', error);
      throw new Error('Failed to upload file to Supabase cloud storage');
    }

    const { data: publicUrlData } = supabase.storage
      .from('assignments')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } else {
    // Local fallback when Supabase keys are not set
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    const uploadDir = path.join(__dirname, '..', 'uploads');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, filename);
    await fs.promises.writeFile(filePath, file.buffer);
    return `/uploads/${filename}`;
  }
};

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
    
    // Process all file uploads through our hybrid handler (Supabase with Local fallback)
    const attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileUrl = await handleFileUpload(file);
        attachments.push(fileUrl);
      }
    }

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
    console.error('Create assignment error:', err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
