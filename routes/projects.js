const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/projects — all projects user is member of (or all if admin)
router.get('/', protect, async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'admin') {
      projects = await Project.find()
        .populate('createdBy', 'name email')
        .populate('members', 'name email role')
        .sort({ createdAt: -1 });
    } else {
      projects = await Project.find({ members: req.user._id })
        .populate('createdBy', 'name email')
        .populate('members', 'name email role')
        .sort({ createdAt: -1 });
    }
    res.json({ projects });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch projects.' });
  }
});

// POST /api/projects — Admin only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, description, members } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required.' });
    }

    const project = await Project.create({
      name,
      description: description || '',
      members: members || [],
      createdBy: req.user._id,
    });

    await project.populate('createdBy', 'name email');
    await project.populate('members', 'name email role');

    res.status(201).json({ message: 'Project created successfully.', project });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    res.status(500).json({ message: 'Failed to create project.' });
  }
});

// GET /api/projects/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    if (!project) return res.status(404).json({ message: 'Project not found.' });

    // Access check: admin sees all, members only see their projects
    const isMember = project.members.some((m) => m._id.toString() === req.user._id.toString());
    if (req.user.role !== 'admin' && !isMember) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json({ project });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch project.' });
  }
});

// PUT /api/projects/:id — Admin only
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, members },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    if (!project) return res.status(404).json({ message: 'Project not found.' });

    res.json({ message: 'Project updated.', project });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update project.' });
  }
});

// DELETE /api/projects/:id — Admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    // Delete all tasks in this project
    await Task.deleteMany({ projectId: req.params.id });

    res.json({ message: 'Project and its tasks deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete project.' });
  }
});

module.exports = router;