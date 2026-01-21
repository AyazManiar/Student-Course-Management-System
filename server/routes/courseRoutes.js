const express = require("express");
const { getCourses, getCoursesWithStudCount, getCourse, addCourse, updateCourse, deleteCourse, getStudentsInCourse, getUnenrolledStudents } = require("../controllers/courseController");
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// GET: /api/courses - Get all courses
router.get("/", authMiddleware, getCourses);
// GET: /api/courses - Get all courses with count
router.get("/withStudCount", authMiddleware, getCoursesWithStudCount);

// GET: /api/courses/:id - Get specific course
router.get("/:id", authMiddleware, getCourse);

// GET: /api/courses/:id/students - Get students enrolled in course
router.get("/:courseid/students", authMiddleware, authorizeRoles("admin"), getStudentsInCourse);

// GET: /api/courses/:id/unenrolled-students - Get students NOT enrolled in course
router.get("/:courseid/unenrolled-students", authMiddleware, authorizeRoles("admin"), getUnenrolledStudents);

// POST: /api/courses - Add new course (Admin/Teacher only)
router.post("/", authMiddleware, authorizeRoles("admin", "teacher"), addCourse);

// PUT: /api/courses/:id - Update course (Admin/Teacher only)
router.put("/:id", authMiddleware, authorizeRoles("admin", "teacher"), updateCourse);

// DELETE: /api/courses/:id - Delete course (Admin only)
router.delete("/:id", authMiddleware, authorizeRoles("admin"), deleteCourse);

module.exports = router;