const db = require("../config/db.js");

const getAllDept = async (req, res) => {
    try {
        const query = "SELECT * FROM departments";
        const [data] = await db.query(query);
        res.status(200).json({
            success: true,
            message: "Fetched all departments",
            data: data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const getDept = async (req, res) => {
    const { id } = req.params;
    try {
        const query = "SELECT * FROM departments WHERE id = ?";
        const [data] = await db.query(query, [id]);
        
        if (data.length === 0) {
            return res.status(404).json({ success: false, message: "Department not found" });
        }

        res.status(200).json({
            success: true,
            message: "Fetched department",
            data: data[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const addDept = async (req, res) => {
    const { name } = req.body;
    try {
        if (!name) {
            return res.status(400).json({ success: false, message: "Department name is required" });
        }

        const query = "INSERT INTO departments (name) VALUES (?)";
        const [data] = await db.query(query, [name]);
        res.status(201).json({
            success: true,
            message: "Department added",
            departmentId: data.insertId
        });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: "Department name already exists" });
        }
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const updateDept = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        if (!name) {
            return res.status(400).json({ success: false, message: "Department name is required" });
        }

        const query = "UPDATE departments SET name = ? WHERE id = ?";
        const [data] = await db.query(query, [name, id]);
        
        if (data.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Department not found" });
        }

        res.status(200).json({
            success: true,
            message: "Department updated"
        });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: "Department name already exists" });
        }
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const deleteDept = async (req, res) => {
    const { id } = req.params;
    try {
        const query = "DELETE FROM departments WHERE id = ?";
        const [data] = await db.query(query, [id]);
        
        if (data.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Department not found" });
        }

        res.status(200).json({
            success: true,
            message: "Department deleted"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = {
    getAllDept,
    getDept,
    addDept,
    updateDept,
    deleteDept
};