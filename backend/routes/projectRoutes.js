const express = require("express");
const mongoose = require("mongoose");
const Project = require("../models/Project");
const User = require("../models/User");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, authorizeRoles("Admin"), async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      members: [req.user._id],
    });

    const populatedProject = await project.populate([
      { path: "createdBy", select: "name email role" },
      { path: "members", select: "name email role" },
    ]);

    res.status(201).json(populatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "Admin") {
      query.createdBy = req.user._id;
    } else {
      query.members = req.user._id;
    }

    const projects = await Project.find(query)
      .populate("createdBy", "name email role")
      .populate("members", "name email role")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/:projectId/members", protect, authorizeRoles("Admin"), async (req, res) => {
  try {
    const { projectId } = req.params;
    const { memberId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ message: "Invalid project or member id" });
    }

    const project = await Project.findOne({ _id: projectId, createdBy: req.user._id });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const member = await User.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (!project.members.some((id) => id.toString() === memberId)) {
      project.members.push(memberId);
      await project.save();
    }

    const updatedProject = await Project.findById(projectId)
      .populate("createdBy", "name email role")
      .populate("members", "name email role");

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
