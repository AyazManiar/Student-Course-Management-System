const express = require("express");
const { getAllDept, getDeptById, getUsersInDept, getCoursesInDept, addDept, updateDept, deleteDept } = require("../controllers/deptController");
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// GET: /api/departments - Get all departments (Public - needed for registration)
router.get("/", getAllDept);

// GET: /api/departments/:id - Get specific department (Public - needed for registration)
router.get("/:id", getDeptById);

// GET: /api/departments/:id/users - Get all users (students + teachers) in department
router.get("/:id/users", authMiddleware, authorizeRoles("admin"), getUsersInDept);

// GET: /api/departments/:id/courses - Get all courses in department
router.get("/:id/courses", authMiddleware, authorizeRoles("admin"), getCoursesInDept);

// POST: /api/departments - Add new department (Admin only)
router.post("/", authMiddleware, authorizeRoles("admin"), addDept);

// PUT: /api/departments/:id - Update department (Admin only)
router.put("/:id", authMiddleware, authorizeRoles("admin"), updateDept);

// DELETE: /api/departments/:id - Delete department (Admin only)
router.delete("/:id", authMiddleware, authorizeRoles("admin"), deleteDept);

module.exports = router;
