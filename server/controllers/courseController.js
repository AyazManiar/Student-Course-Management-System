const db = require("../config/db.js");

// Get all courses
const getCourses = async (req, res) => {
  console.log(`[GetCourses] Fetching courses`);

  try {
    let query = `SELECT c.*, d.name as dept_name, t.name as teacher_name
                  FROM courses c LEFT JOIN departments d ON c.dept_id = d.id 
                  LEFT JOIN teachers t ON c.teacher_id = t.id
                  ORDER BY c.name ASC`;
    const [rows] = await db.query(query);
    console.log(`[GetCourses] Success - Found ${rows.length} courses`);

    return res.status(200).json({
      success: true,
      message: "Fetched all courses",
      data: rows
    });
  } catch (error) {
    console.error(`[GetCourses] Error fetching courses:`, error.message);
    console.error(`[GetCourses] Stack:`, error.stack);
    res.status(500).json({ success: false, message: "Failed to fetch courses - Internal Server Error" });
  }
};
// Get all courses with EnrollmentCount 
const getCoursesWithStudCount = async (req, res) => {
  console.log(`[getCoursesWithStudCount] Fetching courses`);

  try {
    let query = `SELECT c.*, d.name as dept_name, t.name as teacher_name,
                  (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id ) as student_count
                  FROM courses c LEFT JOIN departments d ON c.dept_id = d.id 
                  LEFT JOIN teachers t ON c.teacher_id = t.id
                  ORDER BY c.name ASC`;
    const [rows] = await db.query(query);
    console.log(`[getCoursesWithStudCount] Success - Found ${rows.length} courses`);

    return res.status(200).json({
      success: true,
      message: "Fetched all courses",
      data: rows
    });
  } catch (error) {
    console.error(`[getCoursesWithStudCount] Error fetching courses:`, error.message);
    console.error(`[getCoursesWithStudCount] Stack:`, error.stack);
    res.status(500).json({ success: false, message: "Failed to fetch courses - Internal Server Error" });
  }
}

// Get specific course
const getCourse = async (req, res) => {
  const { id } = req.params;
  console.log(`[GetCourse] Fetching course - ID: ${id}`);

  try {
    const query = `SELECT c.*, d.name as dept_name, t.name as teacher_name 
                    FROM courses c LEFT JOIN departments d ON c.dept_id = d.id 
                    LEFT JOIN teachers t ON c.teacher_id = t.id 
                    WHERE c.id = ?`;
    const [rows] = await db.query(query, [id]);

    if (rows.length === 0) {
      console.log(`[GetCourse] Course not found - ID: ${id}`);
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    console.log(`[GetCourse] Success - Course found: ${rows[0].name}`);
    return res.status(200).json({
      success: true,
      message: "Fetched course",
      data: rows[0]
    });
  } catch (error) {
    console.error(`[GetCourse] Error fetching course:`, error.message);
    console.error(`[GetCourse] Stack:`, error.stack);
    res.status(500).json({ success: false, message: "Failed to fetch course - Internal Server Error" });
  }
};

// Add Course (Admin/Teacher)
const addCourse = async (req, res) => {
  const { name, description, dept_id, teacher_id } = req.body;
  console.log(`[AddCourse] Creating course - Name: ${name}`);

  try {
    if (!name) {
      console.log(`[AddCourse] Validation failed - Course name required`);
      return res.status(400).json({ success: false, message: "Course name is required" });
    }

    console.log(`[AddCourse] Inserting course: ${name}`);
    const [result] = await db.query(
      "INSERT INTO courses (name, description, dept_id, teacher_id) VALUES (?, ?, ?, ?)",
      [name, description || null, dept_id || null, teacher_id || null]
    );

    console.log(`[AddCourse] Success - Course created: ${name} (ID: ${result.insertId})`);
    res.status(201).json({
      success: true,
      message: "Course added",
      courseId: result.insertId
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log(`[AddCourse] Duplicate course name: ${name}`);
      return res.status(400).json({ success: false, message: "Course name already exists" });
    }
    console.error(`[AddCourse] Error creating course:`, error.message);
    console.error(`[AddCourse] Stack:`, error.stack);
    res.status(500).json({ success: false, message: "Failed to create course - Internal Server Error" });
  }
};

// Update Course
const updateCourse = async (req, res) => {
    const { id } = req.params;
    const { name, description, dept_id, teacher_id } = req.body;
    console.log(`[UpdateCourse] Updating course - ID: ${id}`);
    
    try {
        let query = "UPDATE courses SET ";
        const params = [];
        const updates = [];
        
        if (name) {
            updates.push("name = ?");
            params.push(name);
            console.log(`[UpdateCourse] Updating name: ${name}`);
        }
        if (description !== undefined) {
            updates.push("description = ?");
            params.push(description);
            console.log(`[UpdateCourse] Updating description`);
        }
        if (dept_id !== undefined) {
            updates.push("dept_id = ?");
            params.push(dept_id);
            console.log(`[UpdateCourse] Updating dept_id: ${dept_id}`);
        }
        if (teacher_id !== undefined) {
            updates.push("teacher_id = ?");
            params.push(teacher_id);
            console.log(`[UpdateCourse] Updating teacher_id: ${teacher_id}`);
        }
        
        if (updates.length === 0) {
            console.log(`[UpdateCourse] No fields to update`);
            return res.status(400).json({ success: false, message: "No fields to update" });
        }
        
        query += updates.join(", ") + " WHERE id = ?";
        params.push(id);
        
        const [result] = await db.query(query, params);
        
        if (result.affectedRows === 0) {
          console.error(`[UpdateCourse] Course not found - ID: ${id}`);
          return res.status(404).json({ success: false, message: "Course not found" });
        }

        console.log(`[UpdateCourse] Success - Course updated (ID: ${id})`);
        return res.status(200).json({ success: true, message: "Course updated" });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`[UpdateCourse] Duplicate course name`);
          return res.status(400).json({ success: false, message: "Course name already exists" });
        }
        console.error(`[UpdateCourse] Error updating course:`, error.message);
        console.error(`[UpdateCourse] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to update course - Internal Server Error" });
    }
};

// Delete Course
const deleteCourse = async (req, res) => {
    const { id } = req.params;
    console.log(`[DeleteCourse] Deleting course - ID: ${id}`);

    try {
        const query = "DELETE FROM courses WHERE id = ?";
        const [data] = await db.query(query, [id]);

        if (data.affectedRows === 0) {
          console.error(`[DeleteCourse] Course not found - ID: ${id}`);
          return res.status(404).json({ success: false, message: "Course not found" });
        }

        console.log(`[DeleteCourse] Success - Course deleted (ID: ${id})`);
        return res.status(200).json({ success: true, message: "Course deleted" });
    } catch (error) {
        console.error(`[DeleteCourse] Error deleting course:`, error.message);
        console.error(`[DeleteCourse] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to delete course - Internal Server Error" });
    }
};

// Get students enrolled in a specific course
const getStudentsInCourse = async (req, res) => {
    const courseId = req.params.courseid;
    console.log(`[GetStudentsInCourse] Fetching students in course - Course ID: ${courseId}`);

    try {
        const query = `
            SELECT s.id, s.name, d.name as dept_name, e.enrolled_at
            FROM enrollments e
            JOIN students s ON e.student_id = s.id
            LEFT JOIN departments d ON s.dept_id = d.id
            WHERE e.course_id = ?
            ORDER BY e.enrolled_at DESC
        `;
        const [data] = await db.query(query, [courseId]);
        console.log(`[GetStudentsInCourse] Success - Found ${data.length} students`);

        res.status(200).json({
            success: true,
            message: "Fetched students in course",
            data: data
        });
    } catch (error) {
        console.error(`[GetStudentsInCourse] Error fetching students:`, error.message);
        console.error(`[GetStudentsInCourse] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to fetch students - Internal Server Error" });
    }
};

// Get students NOT enrolled in a specific course
const getUnenrolledStudents = async (req, res) => {
    const { courseid } = req.params;
    console.log(`[GetUnenrolledStudents] Fetching students not enrolled in course - Course ID: ${courseid}`);

    try {
        const query = `
            SELECT s.id, s.name, d.name as dept_name, s.created_at
            FROM students s
            LEFT JOIN departments d ON s.dept_id = d.id
            WHERE s.id NOT IN (
                SELECT student_id 
                FROM enrollments 
                WHERE course_id = ?
            )
            ORDER BY s.name ASC
        `;
        const [data] = await db.query(query, [courseid]);
        console.log(`[GetUnenrolledStudents] Success - Found ${data.length} unenrolled students`);

        res.status(200).json({
            success: true,
            message: "Fetched unenrolled students",
            data: data
        });
    } catch (error) {
        console.error(`[GetUnenrolledStudents] Error fetching students:`, error.message);
        console.error(`[GetUnenrolledStudents] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to fetch students - Internal Server Error" });
    }
};

module.exports = {
    getCourses,
    getCoursesWithStudCount,
    getCourse,
    addCourse,
    updateCourse,
    deleteCourse,
    getStudentsInCourse,
    getUnenrolledStudents
};