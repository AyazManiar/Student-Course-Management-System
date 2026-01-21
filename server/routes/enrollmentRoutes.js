const express = require("express");
const { getEnrolledCourses, getEnrolledCoursesOfSpecificStudent,
    enrollInCourse, enrollOtherInCourse, 
    unenrollFromCourse, unEnrollOtherFromCourse, unenrollOtherBulk, getAllEnrollments } = require("../controllers/stu_courseController");
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// GET: /api/enrollments - Get all enrollments (Admin only)
router.get("/", authMiddleware, authorizeRoles("admin"), getAllEnrollments);

// GET: /api/enrollments/my-courses - Get enrolled courses for logged-in student
router.get("/my-courses", authMiddleware, authorizeRoles("student"), getEnrolledCourses);


// GET: /api/enrollments/student/:id - Get enrolled courses for specific student
router.get("/student/:id", authMiddleware, authorizeRoles("admin"), getEnrolledCoursesOfSpecificStudent);


// POST: /api/enrollments/enroll - Enroll in a course (Student only)
router.post("/enroll", authMiddleware, authorizeRoles("student"), enrollInCourse);

// POST: /api/enrollments/enroll - Enroll in a course (Admin only)
router.post("/enrollOther", authMiddleware, authorizeRoles("admin"), enrollOtherInCourse);

// DELETE: /api/enrollments/unenroll - Unenroll from a course (Student only)
router.delete("/unenroll", authMiddleware, authorizeRoles("student"), unenrollFromCourse);


// DELETE: /api/enrollments/unenroll - Unenroll student from a course (Admin only)
router.delete("/unenrollOther", authMiddleware, authorizeRoles("admin"), unEnrollOtherFromCourse);

// DELETE: /api/enrollments/unenrollOtherBulk - Bulk unenroll students from course (Admin only)
router.delete("/unenrollOtherBulk", authMiddleware, authorizeRoles("admin"), unenrollOtherBulk);

module.exports = router;
