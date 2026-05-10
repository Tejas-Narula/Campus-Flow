const express = require('express');
const router = express.Router();
const Institution = require('../models/Institution');
const authMiddleware = require('../middleware/authMiddleware');

// Require auth for all institution routes
router.use(authMiddleware);

// @route   GET /api/institutions
router.get('/', async (req, res) => {
  try {
    const institutions = await Institution.find({ owner: req.teacher.id }).sort({ createdAt: 1 });
    res.json(institutions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/institutions
router.post('/', async (req, res) => {
  try {
    const institution = new Institution({
      name: req.body.name,
      details: req.body.details,
      owner: req.teacher.id
    });
    const createdInstitution = await institution.save();
    res.status(201).json(createdInstitution);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
