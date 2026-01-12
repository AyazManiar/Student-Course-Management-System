const express = require("express");
const { register, login, logout, getCurrentUser } = require("../controllers/authController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// POST: /api/auth/register
router.post("/register", register);

// POST: /api/auth/login
router.post("/login", login);

// POST: /api/auth/logout
router.post("/logout", logout);

// GET: /api/auth/me
router.get("/me", authMiddleware, getCurrentUser);

module.exports = router;