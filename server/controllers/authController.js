const db = require("../config/db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register - POST: /api/auth/register
const register = async (req, res) => {
    const { name, email, password, role, dept_id } = req.body;
    console.log(`[Register] Starting registration - Email: ${email}, Role: ${role}`);
    
    // Validate role
    if (!['student', 'teacher', 'admin'].includes(role)) {
        console.log(`[Register] Invalid role: ${role}`);
        return res.status(400).json({ success: false, message: "Invalid role" });
    }

    try {
        // Check if user with same email already exists
        console.log(`[Register] Checking if email exists: ${email}`);
        const [existingUser] = await db.query("SELECT id FROM auth_users WHERE email = ?", [email]);
        if (existingUser.length > 0) {
            console.log(`[Register] Email already exists: ${email}`);
            return res.status(400).json({ success: false, message: "Email already exists" });
        }

        // Hash Password
        console.log(`[Register] Hashing password`);
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into auth_users
        console.log(`[Register] Creating auth_user record`);
        const [authResult] = await db.query(
            "INSERT INTO auth_users (email, password, role) VALUES (?, ?, ?)",
            [email, hashedPassword, role]
        );
        const userId = authResult.insertId;
        console.log(`[Register] auth_user created - ID: ${userId}`);

        // Insert into role-specific table
        if (role === 'student') {
            console.log(`[Register] Creating student record - ID: ${userId}`);
            await db.query(
                "INSERT INTO students (auth_id, name, dept_id) VALUES (?, ?, ?)",
                [userId, name, dept_id || null]
            );
            console.log(`[Register] Student record created`);
        } else if (role === 'teacher') {
            console.log(`[Register] Creating teacher record - ID: ${userId}`);
            await db.query(
                "INSERT INTO teachers (auth_id, name, dept_id) VALUES (?, ?, ?)",
                [userId, name, dept_id || null]
            );
            console.log(`[Register] Teacher record created`);
        } else if (role === 'admin') {
            console.log(`[Register] Creating admin record - ID: ${userId}`);
            await db.query(
                "INSERT INTO admins (auth_id, name) VALUES (?, ?)",
                [userId, name]
            );
            console.log(`[Register] Admin record created`);
        }

        // Create JSON token
        console.log(`[Register] Generating JWT token`);
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

        console.log(`[Register] Success - User registered: ${email} (ID: ${userId})`);
        // Send response
        res.status(201).json({ 
            success: true, 
            message: "Account registered successfully",
            user: { id: userId, email, role, name }
        });
    } catch (error) {
        console.error(`[Register] Error during registration:`, error.message);
        console.error(`[Register] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Registration failed - Internal Server Error" });
    }
};

// Login - POST: /api/auth/login
const login = async (req, res) => {
    const { email, password } = req.body;
    console.log(`[Login] Login attempt - Email: ${email}`);
    
    try {
        // Check if user exists and get role
        console.log(`[Login] Checking auth_users for email: ${email}`);
        const [users] = await db.query(
            "SELECT id, email, password, role FROM auth_users WHERE email = ?",
            [email]
        );

        if (!users || users.length === 0) {
            console.log(`[Login] User not found: ${email}`);
            return res.status(400).json({ success: false, message: "Incorrect email or password" });
        }

        const user = users[0];
        console.log(`[Login] User found - ID: ${user.id}, Role: ${user.role}`);

        // Compare password
        console.log(`[Login] Verifying password`);
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log(`[Login] Password mismatch for: ${email}`);
            return res.status(400).json({ success: false, message: "Incorrect email or password" });
        }
        console.log(`[Login] Password verified successfully`);

        // Get user details from role-specific table
        let userDetails;
        console.log(`[Login] Fetching ${user.role} details`);
        if (user.role === 'student') {
            const [students] = await db.query("SELECT name FROM students WHERE auth_id = ?", [user.id]);
            userDetails = students[0];
        } else if (user.role === 'teacher') {
            const [teachers] = await db.query("SELECT name FROM teachers WHERE auth_id = ?", [user.id]);
            userDetails = teachers[0];
        } else if (user.role === 'admin') {
            const [admins] = await db.query("SELECT name FROM admins WHERE auth_id = ?", [user.id]);
            userDetails = admins[0];
        }

        if (!userDetails) {
            console.error(`[Login] ${user.role} record not found for user ID: ${user.id}`);
            return res.status(500).json({ success: false, message: `${user.role} profile not found` });
        }
        console.log(`[Login] User details fetched - Name: ${userDetails.name}`);

        // Create token
        console.log(`[Login] Generating JWT token`);
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

        console.log(`[Login] Success - User logged in: ${email} (Role: ${user.role})`);
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
        console.error(`[Login] Error during login:`, error.message);
        console.error(`[Login] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Login failed - Internal Server Error" });
    }
};

// Logout - POST: /api/auth/logout
const logout = (req, res) => {
    console.log(`[Logout] User logging out`);
    res.clearCookie("token");
    console.log(`[Logout] Token cleared - Logout successful`);
    res.status(200).json({ success: true, message: "Logged out successfully" });
};

// Get current user - GET: /api/auth/me
const getCurrentUser = async (req, res) => {
    const userId = req.user.id;
    const role = req.user.role;
    console.log(`[GetCurrentUser] Fetching user details - ID: ${userId}, Role: ${role}`);
    
    try {
        let userDetails;
        if (role === 'student') {
            console.log(`[GetCurrentUser] Querying student table`);
            const [students] = await db.query(
                `SELECT s.id, s.name, au.email 
                    FROM students s
                    JOIN auth_users au ON s.auth_id = au.id 
                    WHERE s.auth_id = ?`,
                [userId]
            );
            userDetails = students[0];
        } else if (role === 'teacher') {
            console.log(`[GetCurrentUser] Querying teacher table`);
            const [teachers] = await db.query(
                `SELECT t.id, t.name, au.email 
                    FROM teachers t 
                    JOIN auth_users au ON t.auth_id = au.id 
                    WHERE t.auth_id = ?`,
                [userId]
            );
            userDetails = teachers[0];
        } else if (role === 'admin') {
            console.log(`[GetCurrentUser] Querying admin table`);
            const [admins] = await db.query(
                "SELECT a.id, a.name, au.email FROM admins a JOIN auth_users au ON a.auth_id = au.id WHERE a.auth_id = ?",
                [userId]
            );
            userDetails = admins[0];
        }

        if (!userDetails) {
            console.error(`[GetCurrentUser] ${role} record not found for ID: ${userId}`);
            return res.status(404).json({ success: false, message: "User not found" });
        }

        console.log(`[GetCurrentUser] Success - User found: ${userDetails.name}`);
        res.status(200).json({
            success: true,
            user: { ...userDetails, role }
        });
    } catch (error) {
        console.error(`[GetCurrentUser] Error fetching user:`, error.message);
        console.error(`[GetCurrentUser] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to fetch user - Internal Server Error" });
    }
};

module.exports = {
    register,
    login,
    logout,
    getCurrentUser
};
