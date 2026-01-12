const express = require("express");
const { getCourses, getCourse, addCourse, updateCourse, deleteCourse } = require("../controllers/courseController");
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// GET: /api/courses - Get all courses (with optional filters)
router.get("/", authMiddleware, getCourses);

// GET: /api/courses/:id - Get specific course
router.get("/:id", authMiddleware, getCourse);

// POST: /api/courses - Add new course (Admin/Teacher only)
router.post("/", authMiddleware, authorizeRoles("admin", "teacher"), addCourse);

// PUT: /api/courses/:id - Update course (Admin/Teacher only)
router.put("/:id", authMiddleware, authorizeRoles("admin", "teacher"), updateCourse);

// DELETE: /api/courses/:id - Delete course (Admin only)
router.delete("/:id", authMiddleware, authorizeRoles("admin"), deleteCourse);

module.exports = router;