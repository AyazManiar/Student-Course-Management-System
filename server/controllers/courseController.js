const db = require("../config/db.js");

// Get all courses
const getCourses = async (req, res) => {
  const { dept_id, teacher_id } = req.query;

  try {
    let query = `SELECT c.*, d.name as dept_name, t.name as teacher_name 
                  FROM courses c LEFT JOIN departments d ON c.dept_id = d.id 
                  LEFT JOIN teachers t ON c.teacher_id = t.id`;
    let params = [];

    if (dept_id) {
      query += " WHERE c.dept_id = ?";
      params.push(dept_id);
    } else if (teacher_id) {
      query += " WHERE c.teacher_id = ?";
      params.push(teacher_id);
    }

    const [rows] = await db.query(query, params);

    return res.status(200).json({
      success: true,
      message: "Fetched all courses",
      data: rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get specific course
const getCourse = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `SELECT c.*, d.name as dept_name, t.name as teacher_name 
                    FROM courses c LEFT JOIN departments d ON c.dept_id = d.id 
                    LEFT JOIN teachers t ON c.teacher_id = t.id 
                    WHERE c.id = ?`;
    const [rows] = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Fetched course",
      data: rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Add Course (Admin/Teacher)
const addCourse = async (req, res) => {
  const { name, description, dept_id, teacher_id } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ success: false, message: "Course name is required" });
    }

    const [result] = await db.query(
      "INSERT INTO courses (name, description, dept_id, teacher_id) VALUES (?, ?, ?, ?)",
      [name, description || null, dept_id || null, teacher_id || null]
    );

    res.status(201).json({
      success: true,
      message: "Course added",
      courseId: result.insertId
    });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: "Course name already exists" });
    }
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Update Course
const updateCourse = async (req, res) => {
    const { id } = req.params;
    const { name, description, dept_id, teacher_id } = req.body;
    
    try {
        let query = "UPDATE courses SET ";
        const params = [];
        const updates = [];
        
        if (name) {
            updates.push("name = ?");
            params.push(name);
        }
        if (description !== undefined) {
            updates.push("description = ?");
            params.push(description);
        }
        if (dept_id !== undefined) {
            updates.push("dept_id = ?");
            params.push(dept_id);
        }
        if (teacher_id !== undefined) {
            updates.push("teacher_id = ?");
            params.push(teacher_id);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: "No fields to update" });
        }
        
        query += updates.join(", ") + " WHERE id = ?";
        params.push(id);
        
        const [result] = await db.query(query, params);
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: "Course not found" });
        }

        return res.status(200).json({ success: true, message: "Course updated" });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ success: false, message: "Course name already exists" });
        }
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Delete Course
const deleteCourse = async (req, res) => {
    const { id } = req.params;

    try {
        const query = "DELETE FROM courses WHERE id = ?";
        const [data] = await db.query(query, [id]);

        if (data.affectedRows === 0) {
          return res.status(404).json({ success: false, message: "Course not found" });
        }

        return res.status(200).json({ success: true, message: "Course deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = {
    getCourses,
    getCourse,
    addCourse,
    updateCourse,
    deleteCourse
};