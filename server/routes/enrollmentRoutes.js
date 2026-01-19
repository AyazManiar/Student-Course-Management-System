const express = require("express");
const { getEnrolledCourses, enrollInCourse, enrollOtherInCourse, 
    unenrollFromCourse, unEnrollOtherFromCourse, getAllEnrollments } = require("../controllers/stu_courseController");
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// GET: /api/enrollments - Get all enrollments (Admin only)
router.get("/", authMiddleware, authorizeRoles("admin"), getAllEnrollments);

// GET: /api/enrollments/my-courses - Get enrolled courses for logged-in student
router.get("/my-courses", authMiddleware, authorizeRoles("student"), getEnrolledCourses);

// POST: /api/enrollments/enroll - Enroll in a course (Student only)
router.post("/enroll", authMiddleware, authorizeRoles("student"), enrollInCourse);

// POST: /api/enrollments/enroll - Enroll in a course (Admin only)
router.post("/enrollOther", authMiddleware, authorizeRoles("admin"), enrollOtherInCourse);

// DELETE: /api/enrollments/unenroll - Unenroll from a course (Student only)
router.delete("/unenroll", authMiddleware, authorizeRoles("student"), unenrollFromCourse);


// DELETE: /api/enrollments/unenroll - Unenroll student from a course (Admin only)
router.delete("/unenrollOther", authMiddleware, authorizeRoles("admin"), unEnrollOtherFromCourse);

module.exports = router;
