const express = require("express");
const { getEnrolledCourses, enrollInCourse, unenrollFromCourse, getAllEnrollments } = require("../controllers/stu_courseController");
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// GET: /api/enrollments - Get all enrollments (Admin only)
router.get("/", authMiddleware, authorizeRoles("admin"), getAllEnrollments);

// GET: /api/enrollments/my-courses - Get enrolled courses for logged-in student
router.get("/my-courses", authMiddleware, authorizeRoles("student"), getEnrolledCourses);

// POST: /api/enrollments/enroll - Enroll in a course (Student only)
router.post("/enroll", authMiddleware, authorizeRoles("student"), enrollInCourse);

// DELETE: /api/enrollments/unenroll - Unenroll from a course (Student only)
router.delete("/unenroll", authMiddleware, authorizeRoles("student"), unenrollFromCourse);

module.exports = router;
