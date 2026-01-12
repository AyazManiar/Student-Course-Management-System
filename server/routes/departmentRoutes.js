const express = require("express");
const { getAllDept, getDept, addDept, updateDept, deleteDept } = require("../controllers/deptController");
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// GET: /api/departments - Get all departments
router.get("/", authMiddleware, getAllDept);

// GET: /api/departments/:id - Get specific department
router.get("/:id", authMiddleware, getDept);

// POST: /api/departments - Add new department (Admin only)
router.post("/", authMiddleware, authorizeRoles("admin"), addDept);

// PUT: /api/departments/:id - Update department (Admin only)
router.put("/:id", authMiddleware, authorizeRoles("admin"), updateDept);

// DELETE: /api/departments/:id - Delete department (Admin only)
router.delete("/:id", authMiddleware, authorizeRoles("admin"), deleteDept);

module.exports = router;
