const db = require("../config/db");

// Get enrolled courses for logged-in student
const getEnrolledCourses = async (req, res) => {
    const student_id = req.user.id;

    try {
        const query = `
            SELECT c.*, d.name as dept_name, t.name as teacher_name, e.enrolled_at 
            FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            LEFT JOIN departments d ON c.dept_id = d.id
            LEFT JOIN teachers t ON c.teacher_id = t.id
            WHERE e.student_id = ?
        `;
        const [data] = await db.query(query, [student_id]);

        res.status(200).json({
            success: true,
            message: "Fetched enrolled courses",
            data: data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Enroll in a course
const enrollInCourse = async (req, res) => {
    const student_id = req.user.id;
    const { course_id } = req.body;

    try {
        if (!course_id) {
            return res.status(400).json({ success: false, message: "Course ID is required" });
        }

        // Check if course exists
        const [course] = await db.query("SELECT id FROM courses WHERE id = ?", [course_id]);
        if (course.length === 0) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        // Check if already enrolled
        const [existing] = await db.query(
            "SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?",
            [student_id, course_id]
        );
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: "Already enrolled in this course" });
        }

        const query = "INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)";
        await db.query(query, [student_id, course_id]);

        res.status(201).json({
            success: true,
            message: "Enrolled in course successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Unenroll from a course
const unenrollFromCourse = async (req, res) => {
    const student_id = req.user.id;
    const { course_id } = req.body;

    try {
        if (!course_id) {
            return res.status(400).json({ success: false, message: "Course ID is required" });
        }

        const query = "DELETE FROM enrollments WHERE student_id = ? AND course_id = ?";
        const [data] = await db.query(query, [student_id, course_id]);

        if (data.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Enrollment not found" });
        }

        res.status(200).json({
            success: true,
            message: "Unenrolled from course successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Get all enrollments (Admin only)
const getAllEnrollments = async (req, res) => {
    try {
        const query = `
            SELECT e.id, e.student_id, s.name as student_name, 
            e.course_id, c.name as course_name, e.enrolled_at
            FROM enrollments e
            JOIN students s ON e.student_id = s.id
            JOIN courses c ON e.course_id = c.id
            ORDER BY e.enrolled_at DESC
        `;
        const [data] = await db.query(query);

        res.status(200).json({
            success: true,
            message: "Fetched all enrollments",
            data: data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = {
    getEnrolledCourses,
    enrollInCourse,
    unenrollFromCourse,
    getAllEnrollments
};