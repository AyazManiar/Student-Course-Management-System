const express = require("express");
const { getAllTeachers, getTeacher, getMyProfile, updateTeacher, deleteTeacher, getMyCourses } = require("../controllers/teacherController");
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// GET: /api/teachers - Get all teachers (with optional filters)
router.get("/", authMiddleware, getAllTeachers);

// GET: /api/teachers/me/profile - Get logged-in teacher's profile
router.get("/me/profile", authMiddleware, authorizeRoles("teacher"), getMyProfile);

// GET: /api/teachers/me/courses - Get courses taught by logged-in teacher
router.get("/me/courses", authMiddleware, authorizeRoles("teacher"), getMyCourses);

// PUT: /api/teachers/me - Update logged-in teacher's profile
router.put("/me", authMiddleware, authorizeRoles("teacher"), updateTeacher);

// DELETE: /api/teachers/:id - Delete teacher (Admin only)
router.delete("/:id", authMiddleware, authorizeRoles("admin"), deleteTeacher);

// GET: /api/teachers/:id - Get specific teacher by ID
router.get("/:id", authMiddleware, getTeacher);

module.exports = router;
