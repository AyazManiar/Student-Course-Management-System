const db = require("../config/db.js");

// Get all students
const getAllStudents = async (req, res) => {
    const { dept_id, course_id } = req.query;
    try {
        let query = `SELECT s.id, s.name, s.dept_id, d.name as dept_name 
                    FROM students s LEFT JOIN departments d 
                    ON s.dept_id = d.id `;
        let params = [];

        if (dept_id) {
            query += " WHERE s.dept_id = ?";
            params.push(dept_id);
        }

        if (course_id) {
            // Get students enrolled in a specific course
            query = `SELECT DISTINCT s.id, s.name, s.dept_id, d.name as dept_name 
                     FROM students s 
                     LEFT JOIN departments d ON s.dept_id = d.id 
                     JOIN enrollments e ON s.id = e.student_id
                     WHERE e.course_id = ?`;
            params = [course_id];
        }

        const [data] = await db.query(query, params);
        res.status(200).json({
            success: true,
            message: "Fetched all students",
            data: data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Get specific student
const getStudent = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `SELECT s.id, s.name, s.dept_id, d.name as dept_name
                        FROM students s LEFT JOIN departments d 
                        ON s.dept_id = d.id 
                        WHERE s.id = ?`;
        const [data] = await db.query(query, [id]);
        
        if (data.length === 0) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        res.status(200).json({
            success: true,
            message: "Fetched student",
            data: data[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Get my profile
const getMyProfile = async (req, res) => {
    const stu_id = req.user.id;
    try {
        const query = `SELECT s.id, s.name, s.dept_id, d.name as dept_name, au.email
                        FROM students s LEFT JOIN departments d ON s.dept_id = d.id
                        JOIN auth_users au ON au.id = s.id
                        WHERE s.id = ?`;
        const [data] = await db.query(query, [stu_id]);
        
        if (data.length === 0) {
            return res.status(404).json({ success: false, message: "Student not found" });
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

// Update student
const updateStudent = async (req, res) => {
    const stu_id = req.user.id;
    const { name, dept_id } = req.body;
    try {
        let query = "UPDATE students SET";
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
        params.push(stu_id);

        await db.query(query, params);

        res.status(200).json({
            success: true,
            message: "Student updated"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Delete student
const deleteStudent = async (req, res) => {
    const stu_id = req.user.id;
    try {
        // This will cascade delete from students table due to foreign key
        await db.query("DELETE FROM auth_users WHERE id = ?", [stu_id]);
        
        res.status(200).json({
            success: true,
            message: "Student deleted"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = {
    getAllStudents,
    getStudent,
    getMyProfile,
    updateStudent,
    deleteStudent
};