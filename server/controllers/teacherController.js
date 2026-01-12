const db = require("../config/db.js");

// Get all teachers
const getAllTeachers = async (req, res) => {
    const { dept_id } = req.query;
    try {
        let query = `SELECT t.id, t.name, t.dept_id, d.name as dept_name
                    FROM teachers t LEFT JOIN departments d ON t.dept_id = d.id `;
        let params = [];

        if (dept_id) {
            query += " WHERE t.dept_id = ?";
            params.push(dept_id);
        }

        const [data] = await db.query(query, params);
        res.status(200).json({
            success: true,
            message: "Fetched all teachers",
            data: data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Get specific teacher
const getTeacher = async (req, res) => {
    const { id } = req.params;
    try {
        const query = ```ELECT t.id, t.name, t.dept_id, d.name as dept_name
                        FROM teachers t LEFT JOIN departments d ON t.dept_id = d.id 
                        WHERE t.id = ?`;
        const [data] = await db.query(query, [id]);
        
        if (data.length === 0) {
            return res.status(404).json({ success: false, message: "Teacher not found" });
        }

        res.status(200).json({
            success: true,
            message: "Fetched teacher",
            data: data[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Get my profile (for logged-in teacher)
const getMyProfile = async (req, res) => {
    const teacher_id = req.user.id;
    try {
        const query = `SELECT t.id, t.name, t.dept_id, d.name as dept_name, au/email
                        FROM teachers t LEFT JOIN departments d ON t.dept_id = d.id
                        JOIN auth_users au ON au.id = t.id
                        WHERE t.id = ?`;
        const [data] = await db.query(query, [teacher_id]);
        
        if (data.length === 0) {
            return res.status(404).json({ success: false, message: "Teacher not found" });
        }

        res.status(200).json({
            success: true,
            message: "Fetched profile",
            data: data[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Update teacher profile
const updateTeacher = async (req, res) => {
    const teacher_id = req.user.id;
    const { name, dept_id } = req.body;
    
    try {
        let query = "UPDATE teachers SET";
        let params = [];
        let updates = [];

        if (name) {
            updates.push(" name = ?");
            params.push(name);
        }
        if (dept_id !== undefined) {
            updates.push(" dept_id = ?");
            params.push(dept_id);
        }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: "No fields to update" });
        }

        query += updates.join(",") + " WHERE id = ?";
        params.push(teacher_id);

        await db.query(query, params);

        res.status(200).json({
            success: true,
            message: "Teacher profile updated"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Delete teacher (admin only)
const deleteTeacher = async (req, res) => {
    const { id } = req.params;
    try {
        // This will cascade delete from teachers table due to foreign key
        await db.query("DELETE FROM auth_users WHERE id = ?", [id]);
        
        res.status(200).json({
            success: true,
            message: "Teacher deleted"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Get courses taught by teacher
const getMyCourses = async (req, res) => {
    const teacher_id = req.user.id;
    try {
        const query = `SELECT c.*, d.name as dept_name 
                        FROM courses c LEFT JOIN departments d ON c.dept_id = d.id 
                        WHERE c.teacher_id = ?`;
        const [data] = await db.query(query, [teacher_id]);
        
        res.status(200).json({
            success: true,
            message: "Fetched teacher's courses",
            data: data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
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
