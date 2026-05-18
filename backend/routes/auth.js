const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');
const Institution = require('../models/Institution');
const authMiddleware = require('../middleware/authMiddleware');

const Student = require('../models/Student');

const generateToken = (id, role = 'teacher') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'fallback_secret_for_local_dev', {
    expiresIn: '30d',
  });
};

const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };
};

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, subjects, password } = req.body;

    const teacherExists = await Teacher.findOne({ email });
    if (teacherExists) {
      return res.status(400).json({ message: 'Teacher already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const teacher = await Teacher.create({
      name,
      email,
      phone,
      subjects,
      password: hashedPassword,
    });

    // Create a default institution for the new teacher
    const defaultInstitution = await Institution.create({
      name: `${name}'s Default Institution`,
      owner: teacher._id,
      details: 'Automatically created institution',
    });

    const token = generateToken(teacher._id);

    res.cookie('token', token, getCookieOptions());

    res.json({
      teacher: { id: teacher._id, name: teacher.name, email: teacher.email },
      defaultInstitution: defaultInstitution._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(teacher._id, 'teacher');

    res.cookie('token', token, getCookieOptions());

    res.json({
      teacher: { id: teacher._id, name: teacher.name, email: teacher.email, role: 'teacher' }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/student-login
router.post('/student-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const students = await Student.find({ email });
    if (!students || students.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password against the first student profile found
    // (Assuming all profiles for the same email share the same password, 
    // or we check the first one as they represent the same user)
    const isMatch = await bcrypt.compare(password, students[0].password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ email, role: 'student' }, process.env.JWT_SECRET || 'fallback_secret_for_local_dev', {
      expiresIn: '30d',
    });

    res.cookie('token', token, getCookieOptions());

    res.json({
      student: { email: students[0].email, name: students[0].name, role: 'student' },
      institutions: students.map(s => s.institution)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'student') {
      const students = await Student.find({ email: req.user.email }).populate('institution');
      if (!students || students.length === 0) {
        return res.status(404).json({ message: 'Student not found' });
      }
      res.json({
        ...students[0].toObject(),
        role: 'student',
        allProfiles: students
      });
    } else {
      // Default to teacher if role isn't student (for backward compatibility with existing tokens)
      const teacher = await Teacher.findById(req.user.id).select('-password');
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
      res.json({ ...teacher.toObject(), role: 'teacher' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', getCookieOptions());
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
