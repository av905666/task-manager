const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/tasks — get tasks based on role/filters
router.get('/', protect, async (req, res) => {
  try {
    const { projectId, status, assignedTo } = req.query;
    let filter = {};

    if (projectId) filter.projectId = projectId;
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;

    // Members only see tasks assigned to them or in their projects
    if (req.user.role === 'member') {
      const memberProjects = await Project.find({ members: req.user._id }).select('_id');
      const projectIds = memberProjects.map((p) => p._id);
      filter.projectId = { $in: projectIds };
    }

    const tasks = await Task.find(filter)
      .populate('projectId', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks.' });
  }
});

// GET /api/tasks/dashboard — dashboard stats
router.get('/dashboard', protect, async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'member') {
      const memberProjects = await Project.find({ members: req.user._id }).select('_id');
      const projectIds = memberProjects.map((p) => p._id);
      filter.projectId = { $in: projectIds };
    }

    const now = new Date();

    const [total, completed, inProgress, overdue, todo] = await Promise.all([
      Task.countDocuments(filter),
      Task.countDocuments({ ...filter, status: 'done' }),
      Task.countDocuments({ ...filter, status: 'in-progress' }),
      Task.countDocuments({ ...filter, status: { $ne: 'done' }, dueDate: { $lt: now, $ne: null } }),
      Task.countDocuments({ ...filter, status: 'todo' }),
    ]);

    // Recent tasks
    const recentTasks = await Task.find(filter)
      .populate('projectId', 'name')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({ stats: { total, completed, inProgress, overdue, todo }, recentTasks });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch dashboard data.' });
  }
});

// POST /api/tasks — Admin only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, status, dueDate } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: 'Title and project are required.' });
    }

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    const task = await Task.create({
      title,
      description: description || '',
      projectId,
      assignedTo: assignedTo || null,
      status: status || 'todo',
      dueDate: dueDate || null,
      createdBy: req.user._id,
    });

    await task.populate('projectId', 'name');
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.status(201).json({ message: 'Task created successfully.', task });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    res.status(500).json({ message: 'Failed to create task.' });
  }
});

// PUT /api/tasks/:id — Admin can update all; Member can only update status
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('projectId', 'members');
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    if (req.user.role === 'member') {
      // Members can only update status, and only for tasks in their projects
      const isMember = task.projectId.members.some(
        (m) => m.toString() === req.user._id.toString()
      );
      if (!isMember) return res.status(403).json({ message: 'Access denied.' });

      const { status } = req.body;
      if (!status) return res.status(400).json({ message: 'Status is required.' });

      task.status = status;
      await task.save();
    } else {
      // Admin can update everything
      const { title, description, projectId, assignedTo, status, dueDate } = req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (projectId) task.projectId = projectId;
      if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
      if (status) task.status = status;
      if (dueDate !== undefined) task.dueDate = dueDate || null;
      await task.save();
    }

    await task.populate('projectId', 'name');
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.json({ message: 'Task updated.', task });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update task.' });
  }
});

// DELETE /api/tasks/:id — Admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json({ message: 'Task deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task.' });
  }
});

module.exports = router;