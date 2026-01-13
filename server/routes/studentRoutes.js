const express = require("express");
const { getAllStudents, getStudent, getMyProfile, addStudent, updateStudent, deleteStudent } = require("../controllers/studentController");
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// GET: /api/students - Get all students (with optional filters)
router.get("/", authMiddleware, getAllStudents);

// POST: /api/students - Create new student (Admin only)
router.post("/", authMiddleware, authorizeRoles("admin"), addStudent);

// GET: /api/students/me/profile - Get logged-in student's profile
router.get("/me/profile", authMiddleware, authorizeRoles("student"), getMyProfile);

// PUT: /api/students/me - Update logged-in student's profile
router.put("/me", authMiddleware, authorizeRoles("student"), updateStudent);

// DELETE: /api/students/me - Delete logged-in student's account
router.delete("/me", authMiddleware, authorizeRoles("student"), deleteStudent);

// GET: /api/students/:id - Get specific student by ID
router.get("/:id", authMiddleware, getStudent);

module.exports = router;
