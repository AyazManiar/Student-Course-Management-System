const express = require("express");
const { getAllAdmins, getAdmin, getMyProfile, updateAdmin, getSystemStats } = require("../controllers/adminController");
const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// All admin routes require admin role
router.use(authMiddleware, authorizeRoles("admin"));

// GET: /api/admins - Get all admins
router.get("/", getAllAdmins);

// GET: /api/admins/me/profile - Get logged-in admin's profile
router.get("/me/profile", getMyProfile);

// GET: /api/admins/stats - Get system statistics
router.get("/stats", getSystemStats);

// PUT: /api/admins/me - Update logged-in admin's profile
router.put("/me", updateAdmin);

// DELETE: /api/admins/:id - Delete admin by ID
// router.delete("/:id", deleteAdmin);

// GET: /api/admins/:id - Get specific admin by ID
router.get("/:id", getAdmin);

module.exports = router;
