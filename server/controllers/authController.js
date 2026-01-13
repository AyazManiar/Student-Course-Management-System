const db = require("../config/db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register - POST: /api/auth/register
const register = async (req, res) => {
    const { name, email, password, role, dept_id } = req.body;
    
    // Validate role
    if (!['student', 'teacher', 'admin'].includes(role)) {
        return res.status(400).json({ success: false, message: "Invalid role" });
    }

    try {
        // Check if user with same email already exists
        const [existingUser] = await db.query("SELECT id FROM auth_users WHERE email = ?", [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ success: false, message: "Email already exists" });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into auth_users
        const [authResult] = await db.query(
            "INSERT INTO auth_users (email, password, role) VALUES (?, ?, ?)",
            [email, hashedPassword, role]
        );
        const userId = authResult.insertId;

        // Insert into role-specific table
        if (role === 'student') {
            await db.query(
                "INSERT INTO students (id, name, dept_id) VALUES (?, ?, ?)",
                [userId, name, dept_id || null]
            );
        } else if (role === 'teacher') {
            await db.query(
                "INSERT INTO teachers (id, name, dept_id) VALUES (?, ?, ?)",
                [userId, name, dept_id || null]
            );
        } else if (role === 'admin') {
            await db.query(
                "INSERT INTO admins (id, name) VALUES (?, ?)",
                [userId, name]
            );
        }

        // Create JSON token
        const token = jwt.sign(
            { id: userId, email, role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send cookie to client
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        // Send response
        res.status(201).json({ 
            success: true, 
            message: "Account registered successfully",
            user: { id: userId, email, role, name }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Login - POST: /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists and get role
        const [users] = await db.query(
            "SELECT id, email, password, role FROM auth_users WHERE email = ?",
            [email]
        );

        if (!users || users.length === 0) {
            return res.status(400).json({ success: false, message: "Incorrect email or password" });
        }

        const user = users[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Incorrect email or password" });
        }

        // Get user details from role-specific table
        let userDetails;
        if (user.role === 'student') {
            const [students] = await db.query("SELECT name, dept_id FROM students WHERE id = ?", [user.id]);
            userDetails = students[0];
        } else if (user.role === 'teacher') {
            const [teachers] = await db.query("SELECT name, dept_id FROM teachers WHERE id = ?", [user.id]);
            userDetails = teachers[0];
        } else if (user.role === 'admin') {
            const [admins] = await db.query("SELECT name FROM admins WHERE id = ?", [user.id]);
            userDetails = admins[0];
        }

        // Create token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(200).json({ 
            success: true, 
            message: "Logged in successfully",
            user: { 
                id: user.id, 
                email: user.email, 
                role: user.role,
                name: userDetails?.name
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Logout - POST: /api/auth/logout
const logout = (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out successfully" });
};

// Get current user - GET: /api/auth/me
const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        let userDetails;
        if (role === 'student') {
            const [students] = await db.query(
                `SELECT s.id, s.name, s.dept_id, d.name as dept_name, au.email 
                    FROM students s LEFT JOIN departments d ON s.dept_id = d.id 
                    JOIN auth_users au ON s.id = au.id 
                    WHERE s.id = ?`,
                [userId]
            );
            userDetails = students[0];
        } else if (role === 'teacher') {
            const [teachers] = await db.query(
                `SELECT t.id, t.name, t.dept_id, d.name as dept_name, au.email 
                    FROM teachers t LEFT JOIN departments d ON t.dept_id = d.id 
                    JOIN auth_users au ON t.id = au.id WHERE t.id = ?`,
                [userId]
            );
            userDetails = teachers[0];
        } else if (role === 'admin') {
            const [admins] = await db.query(
                "SELECT a.id, a.name, au.email FROM admins a JOIN auth_users au ON a.id = au.id WHERE a.id = ?",
                [userId]
            );
            userDetails = admins[0];
        }

        if (!userDetails) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            user: { ...userDetails, role }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = {
    register,
    login,
    logout,
    getCurrentUser
};
