const db = require("../config/db");

// Get all enrollments (Admin only)
const getAllEnrollments = async (req, res) => {
    console.log(`[GetAllEnrollments] Fetching all enrollments`);
    try {
        const query = `
            SELECT e.id as enroll_id, e.student_id, s.name as student_name, 
            e.course_id, c.name as course_name, e.enrolled_at
            FROM enrollments e
            JOIN students s ON e.student_id = s.id
            JOIN courses c ON e.course_id = c.id
            ORDER BY e.enrolled_at DESC
        `;
        const [data] = await db.query(query);
        console.log(`[GetAllEnrollments] Success - Found ${data.length} enrollments`);

        res.status(200).json({
            success: true,
            message: "Fetched all enrollments",
            data: data
        });
    } catch (error) {
        console.error(`[GetAllEnrollments] Error fetching enrollments:`, error.message);
        console.error(`[GetAllEnrollments] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to fetch enrollments - Internal Server Error" });
    }
};

// Get enrolled courses for logged-in student
const getEnrolledCourses = async (req, res) => {
    const student_id = req.user.id;
    console.log(`[GetEnrolledCourses] Fetching enrolled courses - Student ID: ${student_id}`);

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
        console.log(`[GetEnrolledCourses] Success - Found ${data.length} enrolled courses`);

        res.status(200).json({
            success: true,
            message: "Fetched enrolled courses",
            data: data
        });
    } catch (error) {
        console.error(`[GetEnrolledCourses] Error fetching enrollments:`, error.message);
        console.error(`[GetEnrolledCourses] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to fetch enrolled courses - Internal Server Error" });
    }
};

// Get Enrolled courses for specific student
// Get enrolled courses for logged-in student
const getEnrolledCoursesOfSpecificStudent = async (req, res) => {
    const student_id = req.params.id;
    console.log(`[getEnrolledCoursesOfSpecificStudent] Fetching enrolled courses - Student ID: ${student_id}`);

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
        console.log(`[getEnrolledCoursesOfSpecificStudent] Success - Found ${data.length} enrolled courses`);

        res.status(200).json({
            success: true,
            message: "Fetched enrolled courses for specific student",
            data: data
        });
    } catch (error) {
        console.error(`[getEnrolledCoursesOfSpecificStudent] Error fetching enrollments:`, error.message);
        console.error(`[getEnrolledCoursesOfSpecificStudent] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to fetch enrolled courses - Internal Server Error" });
    }
};


// Enroll in a course
const enrollInCourse = async (req, res) => {
    const student_id = req.user.id;
    const { course_id } = req.body;
    console.log(`[EnrollInCourse] Student enrolling - Student ID: ${student_id}, Course ID: ${course_id}`);

    try {
        if (!course_id) {
            console.log(`[EnrollInCourse] Validation failed - Course ID required`);
            return res.status(400).json({ success: false, message: "Course ID is required" });
        }

        // Check if course exists
        console.log(`[EnrollInCourse] Checking if course exists: ${course_id}`);
        const [course] = await db.query("SELECT id FROM courses WHERE id = ?", [course_id]);
        if (course.length === 0) {
            console.log(`[EnrollInCourse] Course not found: ${course_id}`);
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        // Check if already enrolled
        console.log(`[EnrollInCourse] Checking if already enrolled`);
        const [existing] = await db.query(
            "SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?",
            [student_id, course_id]
        );
        if (existing.length > 0) {
            console.log(`[EnrollInCourse] Student already enrolled in course ${course_id}`);
            return res.status(400).json({ success: false, message: "Already enrolled in this course" });
        }

        const query = "INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)";
        await db.query(query, [student_id, course_id]);

        console.log(`[EnrollInCourse] Success - Student ${student_id} enrolled in course ${course_id}`);
        res.status(201).json({
            success: true,
            message: "Enrolled in course successfully"
        });
    } catch (error) {
        console.error(`[EnrollInCourse] Error enrolling student:`, error.message);
        console.error(`[EnrollInCourse] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to enroll in course - Internal Server Error" });
    }
};


// Enroll someone else in course (Admin Only)
// POST: /api/enrollments/enroll
const enrollOtherInCourse = async (req, res)=> {
    const { student_id, course_id } = req.body;
    console.log(`[EnrollOtherInCourse] Admin enrolling student - Student ID: ${student_id}, Course ID: ${course_id}`);
    
    if(!student_id || !course_id) {
        console.log(`[EnrollOtherInCourse] Validation failed - Student ID and Course ID required`);
        return res.status(400).json({ success: false, message: "Student ID and Course ID are required" })
    }
    try {
        // Check if already enrolled
        console.log(`[EnrollOtherInCourse] Checking if student already enrolled`);
        const [existing] = await db.query(
            "SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?",
            [student_id, course_id]
        );
        if (existing.length > 0) {
            console.log(`[EnrollOtherInCourse] Student already enrolled in course`);
            return res.status(400).json({ success: false, message: "Student already enrolled in this course" });
        }

        const [data] = await db.query("INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)", [student_id, course_id]);
        
        if (data.affectedRows === 0) {
            console.error(`[EnrollOtherInCourse] Failed to insert enrollment record`);
            return res.status(500).json({ success: false, message: "Failed to enroll student in course" });
        }
    
        console.log(`[EnrollOtherInCourse] Success - Student ${student_id} enrolled in course ${course_id}`);
        res.status(201).json({
            success: true,
            message: "Enrolled in course successfully",
            data: data.insertId
        });
    } catch (error) {
        console.error(`[EnrollOtherInCourse] Error enrolling student:`, error.message);
        console.error(`[EnrollOtherInCourse] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to enroll student - Internal Server Error" });
    }
}

// Unenroll from a course
const unenrollFromCourse = async (req, res) => {
    const student_id = req.user.id;
    const { course_id } = req.body;
    console.log(`[UnenrollFromCourse] Student unenrolling - Student ID: ${student_id}, Course ID: ${course_id}`);
    
    try {
        if (!course_id) {
            console.log(`[UnenrollFromCourse] Validation failed - Course ID required`);
            return res.status(400).json({ success: false, message: "Course ID is required" });
        }

        const query = "DELETE FROM enrollments WHERE student_id = ? AND course_id = ?";
        const [data] = await db.query(query, [student_id, course_id]);

        if (data.affectedRows === 0) {
            console.log(`[UnenrollFromCourse] Enrollment not found for student ${student_id}, course ${course_id}`);
            return res.status(404).json({ success: false, message: "Enrollment not found" });
        }

        console.log(`[UnenrollFromCourse] Success - Student ${student_id} unenrolled from course ${course_id}`);
        res.status(200).json({
            success: true,
            message: "Unenrolled from course successfully"
        });
    } catch (error) {
        console.error(`[UnenrollFromCourse] Error unenrolling student:`, error.message);
        console.error(`[UnenrollFromCourse] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to unenroll - Internal Server Error" });
    }
};
const unEnrollOtherFromCourse = async (req, res) => {
    const { enrollId } = req.body;
    console.log(`[UnEnrollOther] Admin unenrolling - Enrollment ID: ${enrollId}`);
    
    if(!enrollId) {
        console.log(`[UnEnrollOther] Validation failed - Enrollment ID required`);
        return res.status(400).json({ success: false, message: "Enrollment ID is required" })
    } 
    try {
        const query = "DELETE FROM enrollments WHERE id = ?";
        const [data] = await db.query(query, [enrollId]);

        if (data.affectedRows === 0) {
            console.log(`[UnEnrollOther] Enrollment not found - ID: ${enrollId}`);
            return res.status(404).json({ success: false, message: "Enrollment not found" });
        }

        console.log(`[UnEnrollOther] Success - Enrollment ${enrollId} deleted`);
        res.status(200).json({
            success: true,
            message: "Unenrolled from course successfully"
        });
    } catch (error) {
        console.error(`[UnEnrollOther] Error deleting enrollment:`, error.message);
        console.error(`[UnEnrollOther] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to unenroll - Internal Server Error" });
    }
}

// Bulk unenroll students from course (Admin only)
const unenrollOtherBulk = async (req, res) => {
    const { student_id, course_id } = req.body;
    console.log(`[UnenrollOtherBulk] Admin unenrolling - Student ID: ${student_id}, Course ID: ${course_id}`);
    
    try {
        if (!student_id || !course_id) {
            console.log(`[UnenrollOtherBulk] Validation failed - Student ID and Course ID required`);
            return res.status(400).json({ success: false, message: "Student ID and Course ID are required" });
        }

        const query = "DELETE FROM enrollments WHERE student_id = ? AND course_id = ?";
        const [data] = await db.query(query, [student_id, course_id]);

        if (data.affectedRows === 0) {
            console.log(`[UnenrollOtherBulk] Enrollment not found - Student: ${student_id}, Course: ${course_id}`);
            return res.status(404).json({ success: false, message: "Enrollment not found" });
        }

        console.log(`[UnenrollOtherBulk] Success - Student ${student_id} unenrolled from course ${course_id}`);
        res.status(200).json({
            success: true,
            message: "Unenrolled from course successfully"
        });
    } catch (error) {
        console.error(`[UnenrollOtherBulk] Error unenrolling student:`, error.message);
        console.error(`[UnenrollOtherBulk] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to unenroll - Internal Server Error" });
    }
};

module.exports = {
    getAllEnrollments,
    getEnrolledCourses,
    getEnrolledCoursesOfSpecificStudent,
    enrollInCourse,
    enrollOtherInCourse,
    unenrollFromCourse,
    unEnrollOtherFromCourse,
    unenrollOtherBulk
};