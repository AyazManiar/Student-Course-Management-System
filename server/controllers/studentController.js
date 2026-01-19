const db = require("../config/db.js");
const bcrypt = require("bcryptjs");

// Get all students
const getAllStudents = async (req, res) => {
    const { dept_id, course_id } = req.query;
    console.log(`[GetAllStudents] Fetching students - Filters: dept_id=${dept_id || 'none'}, course_id=${course_id || 'none'}`);
    try {
        let query = `SELECT s.id, s.name, s.dept_id, d.name as dept_name, au.created_at 
                    FROM students s 
                    LEFT JOIN departments d ON s.dept_id = d.id
                    JOIN auth_users au ON au.id = s.id`;
        let params = [];

        if (dept_id) {
            query += " WHERE s.dept_id = ?";
            params.push(dept_id);
            console.log(`[GetAllStudents] Filtering by department ID: ${dept_id}`);
        }

        if (course_id) {
            // Get students enrolled in a specific course
            query = `SELECT DISTINCT s.id, s.name, s.dept_id, d.name as dept_name 
                     FROM students s 
                     LEFT JOIN departments d ON s.dept_id = d.id 
                     JOIN enrollments e ON s.id = e.student_id
                     WHERE e.course_id = ?`;
            params = [course_id];
            console.log(`[GetAllStudents] Filtering by course ID: ${course_id}`);
        }

        const [data] = await db.query(query, params);
        console.log(`[GetAllStudents] Success - Found ${data.length} students`);
        res.status(200).json({
            success: true,
            message: "Fetched all students",
            data: data
        });
    } catch (error) {
        console.error(`[GetAllStudents] Error fetching students:`, error.message);
        console.error(`[GetAllStudents] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to fetch students - Internal Server Error" });
    }
};

// Get specific student
const getStudent = async (req, res) => {
    const { id } = req.params;
    console.log(`[GetStudent] Fetching student - ID: ${id}`);
    try {
        const query = `SELECT s.id, s.name, s.dept_id, d.name as dept_name
                        FROM students s LEFT JOIN departments d 
                        ON s.dept_id = d.id 
                        WHERE s.id = ?`;
        const [data] = await db.query(query, [id]);
        
        if (data.length === 0) {
            console.log(`[GetStudent] Student not found - ID: ${id}`);
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        console.log(`[GetStudent] Success - Student found: ${data[0].name}`);
        res.status(200).json({
            success: true,
            message: "Fetched student",
            data: data[0]
        });
    } catch (error) {
        console.error(`[GetStudent] Error fetching student:`, error.message);
        console.error(`[GetStudent] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to fetch student - Internal Server Error" });
    }
};

// Get my profile
const getMyProfile = async (req, res) => {
    const stu_id = req.user.id;
    console.log(`[GetMyProfile-Student] Fetching profile - Student ID: ${stu_id}`);
    try {
        const query = `SELECT s.id, s.name, s.dept_id, d.name as dept_name, au.email
                        FROM students s LEFT JOIN departments d ON s.dept_id = d.id
                        JOIN auth_users au ON au.id = s.id
                        WHERE s.id = ?`;
        const [data] = await db.query(query, [stu_id]);
        
        if (data.length === 0) {
            console.error(`[GetMyProfile-Student] Student profile not found - ID: ${stu_id}`);
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        console.log(`[GetMyProfile-Student] Success - Student: ${data[0].name}`);
        res.status(200).json({
            success: true,
            message: "Fetched profile",
            data: data[0]
        });
    } catch (error) {
        console.error(`[GetMyProfile-Student] Error fetching profile:`, error.message);
        console.error(`[GetMyProfile-Student] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to fetch profile - Internal Server Error" });
    }
};

// Add student (Admin only)
const addStudent = async (req, res) => {
    const { name, email, password, dept_id } = req.body;
    console.log(`[AddStudent] Creating student - Email: ${email}, Name: ${name}`);
    
    // Validation
    if (!name || !email || !password) {
        console.log(`[AddStudent] Validation failed - Missing required fields`);
        return res.status(400).json({ 
            success: false, 
            message: "Name, email, and password are required" 
        });
    }

    try {
        // Check if email already exists
        console.log(`[AddStudent] Checking if email exists: ${email}`);
        const [existingUser] = await db.query(
            "SELECT id FROM auth_users WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            console.log(`[AddStudent] Email already exists: ${email}`);
            return res.status(400).json({ 
                success: false, 
                message: "Email already exists" 
            });
        }

        // Hash password
        console.log(`[AddStudent] Hashing password`);
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into auth_users
        console.log(`[AddStudent] Creating auth_user record`);
        const [authResult] = await db.query(
            "INSERT INTO auth_users (email, password, role) VALUES (?, ?, 'student')",
            [email, hashedPassword]
        );

        const studentId = authResult.insertId;
        console.log(`[AddStudent] auth_user created - ID: ${studentId}`);

        // Insert into students table
        console.log(`[AddStudent] Creating student record`);
        await db.query(
            "INSERT INTO students (id, name, dept_id) VALUES (?, ?, ?)",
            [studentId, name, dept_id || null]
        );

        console.log(`[AddStudent] Success - Student created: ${name} (ID: ${studentId})`);
        res.status(201).json({
            success: true,
            message: "Student created successfully",
            data: { id: studentId, name, email }
        });
    } catch (error) {
        console.error(`[AddStudent] Error creating student:`, error.message);
        console.error(`[AddStudent] Stack:`, error.stack);
        res.status(500).json({ 
            success: false, 
            message: "Failed to create student - Internal Server Error" 
        });
    }
};

// Update student
const updateStudent = async (req, res) => {
    const stu_id = req.user.id;
    const { name, dept_id } = req.body;
    console.log(`[UpdateStudent] Updating student - ID: ${stu_id}`);
    try {
        let query = "UPDATE students SET";
        let params = [];
        let updates = [];

        if (name) {
            updates.push(" name = ?");
            params.push(name);
            console.log(`[UpdateStudent] Updating name: ${name}`);
        }
        if (dept_id !== undefined) {
            updates.push(" dept_id = ?");
            params.push(dept_id);
            console.log(`[UpdateStudent] Updating dept_id: ${dept_id}`);
        }

        if (updates.length === 0) {
            console.log(`[UpdateStudent] No fields to update`);
            return res.status(400).json({ success: false, message: "No fields to update" });
        }

        query += updates.join(",") + " WHERE id = ?";
        params.push(stu_id);

        const [result] = await db.query(query, params);
        
        if (result.affectedRows === 0) {
            console.error(`[UpdateStudent] Student not found - ID: ${stu_id}`);
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        console.log(`[UpdateStudent] Success - Student updated (ID: ${stu_id})`);
        res.status(200).json({
            success: true,
            message: "Student updated"
        });
    } catch (error) {
        console.error(`[UpdateStudent] Error updating student:`, error.message);
        console.error(`[UpdateStudent] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to update student - Internal Server Error" });
    }
};

// Delete student
const deleteStudent = async (req, res) => {
    const stu_id = req.user.id;
    console.log(`[DeleteStudent] Deleting student - ID: ${stu_id}`);
    try {
        // This will cascade delete from students table due to foreign key
        const [result] = await db.query("DELETE FROM auth_users WHERE id = ?", [stu_id]);
        
        if (result.affectedRows === 0) {
            console.error(`[DeleteStudent] Student not found - ID: ${stu_id}`);
            return res.status(404).json({ success: false, message: "Student not found" });
        }
        
        console.log(`[DeleteStudent] Success - Student deleted (ID: ${stu_id})`);
        res.status(200).json({
            success: true,
            message: "Student deleted"
        });
    } catch (error) {
        console.error(`[DeleteStudent] Error deleting student:`, error.message);
        console.error(`[DeleteStudent] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to delete student - Internal Server Error" });
    }
};
// Remove Student
const removeStudent = async (req, res) => {
    const stu_id = req.body.stu_id;
    console.log(`[RemoveStudent] Admin removing student - ID: ${stu_id}`);
    try {
        if (!stu_id) {
            console.log(`[RemoveStudent] Validation failed - Student ID required`);
            return res.status(400).json({ success: false, message: "Student ID is required" });
        }
        
        // This will cascade delete from students table due to foreign key
        const [result] = await db.query("DELETE FROM auth_users WHERE id = ?", [stu_id]);
        
        if (result.affectedRows === 0) {
            console.error(`[RemoveStudent] Student not found - ID: ${stu_id}`);
            return res.status(404).json({ success: false, message: "Student not found" });
        }
        
        console.log(`[RemoveStudent] Success - Student removed (ID: ${stu_id})`);
        res.status(200).json({
            success: true,
            message: "Student deleted"
        });
    } catch (error) {
        console.error(`[RemoveStudent] Error removing student:`, error.message);
        console.error(`[RemoveStudent] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to remove student - Internal Server Error" });
    }
}

module.exports = {
    getAllStudents,
    getStudent,
    getMyProfile,
    addStudent,
    updateStudent,
    deleteStudent,
    removeStudent
};