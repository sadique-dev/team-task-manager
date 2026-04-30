const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, authorizeRoles("Admin"), async (req, res) => {
  try {
    const { title, description, deadline, assignedTo, projectId } = req.body;

    if (!title || !deadline || !assignedTo || !projectId) {
      return res.status(400).json({ message: "title, deadline, assignedTo and projectId are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(assignedTo)) {
      return res.status(400).json({ message: "Invalid project or assignee id" });
    }

    const project = await Project.findOne({ _id: projectId, createdBy: req.user._id });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const assignee = await User.findById(assignedTo);
    if (!assignee) {
      return res.status(404).json({ message: "Assigned user not found" });
    }

    const isMemberOfProject = project.members.some((memberId) => memberId.toString() === assignedTo);
    if (!isMemberOfProject) {
      return res.status(400).json({ message: "Assigned user must be added to the project first" });
    }

    const task = await Task.create({
      title,
      description,
      deadline,
      assignedTo,
      projectId,
    });

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email role")
      .populate("projectId", "name description");

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "Admin") {
      const adminProjects = await Project.find({ createdBy: req.user._id }).select("_id");
      query.projectId = { $in: adminProjects.map((project) => project._id) };
    } else {
      query.assignedTo = req.user._id;
    }

    const tasks = await Task.find(query)
      .populate("assignedTo", "name email role")
      .populate("projectId", "name description")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:taskId/status", protect, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!["pending", "in-progress", "done"].includes(status)) {
      return res.status(400).json({ message: "Invalid task status" });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (req.user.role !== "Admin" && task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only update your own assigned tasks" });
    }

    if (req.user.role === "Admin") {
      const project = await Project.findById(task.projectId);
      if (!project || project.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You can only update tasks in your projects" });
      }
    }

    task.status = status;
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email role")
      .populate("projectId", "name description");

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
