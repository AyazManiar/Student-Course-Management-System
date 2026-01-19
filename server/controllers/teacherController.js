const db = require("../config/db.js");

// Get all teachers
const getAllTeachers = async (req, res) => {
    console.log(`[GetAllTeachers] Fetching teachers`);
    try {
        let query = `SELECT t.id, t.name, t.dept_id, d.name as dept_name, au.email, t.created_at
                    FROM teachers t 
                    LEFT JOIN departments d ON t.dept_id = d.id
                    JOIN auth_users au ON au.id = t.id`;
        
        const [data] = await db.query(query);
        console.log(`[GetAllTeachers] Success - Found ${data.length} teachers`);
        res.status(200).json({
            success: true,
            message: "Fetched all teachers",
            data: data
        });
    } catch (error) {
        console.error(`[GetAllTeachers] Error fetching teachers:`, error.message);
        console.error(`[GetAllTeachers] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to fetch teachers - Internal Server Error" });
    }
};

// Get specific teacher
const getTeacher = async (req, res) => {
    const { id } = req.params;
    console.log(`[GetTeacher] Fetching teacher - ID: ${id}`);
    try {
        const query = `SELECT t.id, t.name, t.dept_id, d.name as dept_name
                        FROM teachers t LEFT JOIN departments d ON t.dept_id = d.id 
                        WHERE t.id = ?`;
        const [data] = await db.query(query, [id]);
        
        if (data.length === 0) {
            console.log(`[GetTeacher] Teacher not found - ID: ${id}`);
            return res.status(404).json({ success: false, message: "Teacher not found" });
        }

        console.log(`[GetTeacher] Success - Teacher found: ${data[0].name}`);
        res.status(200).json({
            success: true,
            message: "Fetched teacher",
            data: data[0]
        });
    } catch (error) {
        console.error(`[GetTeacher] Error fetching teacher:`, error.message);
        console.error(`[GetTeacher] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to fetch teacher - Internal Server Error" });
    }
};

// Get my profile (for logged-in teacher)
const getMyProfile = async (req, res) => {
    const teacher_id = req.user.id;
    console.log(`[GetMyProfile-Teacher] Fetching profile - Teacher ID: ${teacher_id}`);
    try {
        const query = `SELECT t.id, t.name, t.dept_id, d.name as dept_name, au.email
                        FROM teachers t LEFT JOIN departments d ON t.dept_id = d.id
                        JOIN auth_users au ON au.id = t.id
                        WHERE t.id = ?`;
        const [data] = await db.query(query, [teacher_id]);
        
        if (data.length === 0) {
            console.error(`[GetMyProfile-Teacher] Teacher profile not found - ID: ${teacher_id}`);
            return res.status(404).json({ success: false, message: "Teacher not found" });
        }

        console.log(`[GetMyProfile-Teacher] Success - Teacher: ${data[0].name}`);
        res.status(200).json({
            success: true,
            message: "Fetched profile",
            data: data[0]
        });
    } catch (error) {
        console.error(`[GetMyProfile-Teacher] Error fetching profile:`, error.message);
        console.error(`[GetMyProfile-Teacher] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to fetch profile - Internal Server Error" });
    }
};

// Update teacher profile
const updateTeacher = async (req, res) => {
    const teacher_id = req.user.id;
    const { name, dept_id } = req.body;
    console.log(`[UpdateTeacher] Updating teacher - ID: ${teacher_id}`);
    
    try {
        let query = "UPDATE teachers SET";
        let params = [];
        let updates = [];

        if (name) {
            updates.push(" name = ?");
            params.push(name);
            console.log(`[UpdateTeacher] Updating name: ${name}`);
        }
        if (dept_id !== undefined) {
            updates.push(" dept_id = ?");
            params.push(dept_id);
            console.log(`[UpdateTeacher] Updating dept_id: ${dept_id}`);
        }

        if (updates.length === 0) {
            console.log(`[UpdateTeacher] No fields to update`);
            return res.status(400).json({ success: false, message: "No fields to update" });
        }

        query += updates.join(",") + " WHERE id = ?";
        params.push(teacher_id);

        const [result] = await db.query(query, params);
        
        if (result.affectedRows === 0) {
            console.error(`[UpdateTeacher] Teacher not found - ID: ${teacher_id}`);
            return res.status(404).json({ success: false, message: "Teacher not found" });
        }

        console.log(`[UpdateTeacher] Success - Teacher updated (ID: ${teacher_id})`);
        res.status(200).json({
            success: true,
            message: "Teacher profile updated"
        });
    } catch (error) {
        console.error(`[UpdateTeacher] Error updating teacher:`, error.message);
        console.error(`[UpdateTeacher] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to update teacher - Internal Server Error" });
    }
};

// Delete teacher (admin only)
const deleteTeacher = async (req, res) => {
    const { id } = req.params;
    console.log(`[DeleteTeacher] Deleting teacher - ID: ${id}`);
    try {
        // This will cascade delete from teachers table due to foreign key
        const [result] = await db.query("DELETE FROM auth_users WHERE id = ?", [id]);
        
        if (result.affectedRows === 0) {
            console.error(`[DeleteTeacher] Teacher not found - ID: ${id}`);
            return res.status(404).json({ success: false, message: "Teacher not found" });
        }
        
        console.log(`[DeleteTeacher] Success - Teacher deleted (ID: ${id})`);
        res.status(200).json({
            success: true,
            message: "Teacher deleted"
        });
    } catch (error) {
        console.error(`[DeleteTeacher] Error deleting teacher:`, error.message);
        console.error(`[DeleteTeacher] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to delete teacher - Internal Server Error" });
    }
};

// Get courses taught by teacher
const getMyCourses = async (req, res) => {
    const teacher_id = req.user.id;
    console.log(`[GetMyCourses-Teacher] Fetching courses - Teacher ID: ${teacher_id}`);
    try {
        const query = `SELECT c.*, d.name as dept_name 
                        FROM courses c LEFT JOIN departments d ON c.dept_id = d.id 
                        WHERE c.teacher_id = ?`;
        const [data] = await db.query(query, [teacher_id]);
        console.log(`[GetMyCourses-Teacher] Success - Found ${data.length} courses`);
        
        res.status(200).json({
            success: true,
            message: "Fetched teacher's courses",
            data: data
        });
    } catch (error) {
        console.error(`[GetMyCourses-Teacher] Error fetching courses:`, error.message);
        console.error(`[GetMyCourses-Teacher] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to fetch courses - Internal Server Error" });
    }
};

module.exports = {
    getAllTeachers,
    getTeacher,
    getMyProfile,
    updateTeacher,
    deleteTeacher,
    getMyCourses
};
