const express = require("express");
const { getAllStudents, getStudent, getMyProfile, addStudent, updateStudent, deleteStudent, removeStudent } = require("../controllers/studentController");
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// GET: /api/students - Get all students (with optional filters)
router.get("/", authMiddleware, getAllStudents);

// POST: /api/students - Create new student (Admin only)
router.post("/", authMiddleware, authorizeRoles("admin"), addStudent);

// GET: /api/students/me/profile - Get logged-in student's profile
router.get("/me/profile", authMiddleware, authorizeRoles("student"), getMyProfile);

// GET: /api/students/:id - Get specific student by ID
router.get("/:id", authMiddleware, authorizeRoles("admin"), getStudent);


// PUT: /api/students/me - Update logged-in student's profile
router.put("/me", authMiddleware, authorizeRoles("student"), updateStudent);

// DELETE: /api/students/me - Delete logged-in student's account
router.delete("/me", authMiddleware, authorizeRoles("student"), deleteStudent);

router.delete("/remove", authMiddleware, authorizeRoles("admin"), removeStudent)

module.exports = router;
