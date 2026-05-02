const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/users — Admin only, list all users for assignment
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ name: 1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
});

// GET /api/users/members — All authenticated users (for member listing)
router.get('/members', protect, async (req, res) => {
  try {
    const users = await User.find({ role: 'member' }).select('-password').sort({ name: 1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch members.' });
  }
});

module.exports = router;