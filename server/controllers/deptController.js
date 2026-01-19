const db = require("../config/db.js");

const getAllDept = async (req, res) => {
    console.log(`[GetAllDept] Fetching all departments`);
    try {
        const query = "SELECT * FROM departments";
        const [data] = await db.query(query);
        console.log(`[GetAllDept] Success - Found ${data.length} departments`);
        res.status(200).json({
            success: true,
            message: "Fetched all departments",
            data: data
        });
    } catch (error) {
        console.error(`[GetAllDept] Error fetching departments:`, error.message);
        console.error(`[GetAllDept] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to fetch departments - Internal Server Error" });
    }
};

const getDept = async (req, res) => {
    const { id } = req.params;
    console.log(`[GetDept] Fetching department - ID: ${id}`);
    try {
        const query = "SELECT * FROM departments WHERE id = ?";
        const [data] = await db.query(query, [id]);
        
        if (data.length === 0) {
            console.log(`[GetDept] Department not found - ID: ${id}`);
            return res.status(404).json({ success: false, message: "Department not found" });
        }

        console.log(`[GetDept] Success - Department found: ${data[0].name}`);
        res.status(200).json({
            success: true,
            message: "Fetched department",
            data: data[0]
        });
    } catch (error) {
        console.error(`[GetDept] Error fetching department:`, error.message);
        console.error(`[GetDept] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to fetch department - Internal Server Error" });
    }
};

const addDept = async (req, res) => {
    const { name } = req.body;
    console.log(`[AddDept] Creating department - Name: ${name}`);
    try {
        if (!name) {
            console.log(`[AddDept] Validation failed - Department name required`);
            return res.status(400).json({ success: false, message: "Department name is required" });
        }

        const query = "INSERT INTO departments (name) VALUES (?)";
        const [data] = await db.query(query, [name]);
        console.log(`[AddDept] Success - Department created: ${name} (ID: ${data.insertId})`);
        res.status(201).json({
            success: true,
            message: "Department added",
            departmentId: data.insertId
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            console.log(`[AddDept] Duplicate department name: ${name}`);
            return res.status(400).json({ success: false, message: "Department name already exists" });
        }
        console.error(`[AddDept] Error creating department:`, error.message);
        console.error(`[AddDept] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to create department - Internal Server Error" });
    }
};

const updateDept = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    console.log(`[UpdateDept] Updating department - ID: ${id}, New Name: ${name}`);
    try {
        if (!name) {
            console.log(`[UpdateDept] Validation failed - Department name required`);
            return res.status(400).json({ success: false, message: "Department name is required" });
        }

        const query = "UPDATE departments SET name = ? WHERE id = ?";
        const [data] = await db.query(query, [name, id]);
        
        if (data.affectedRows === 0) {
            console.error(`[UpdateDept] Department not found - ID: ${id}`);
            return res.status(404).json({ success: false, message: "Department not found" });
        }

        console.log(`[UpdateDept] Success - Department updated: ${name} (ID: ${id})`);
        res.status(200).json({
            success: true,
            message: "Department updated"
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            console.log(`[UpdateDept] Duplicate department name: ${name}`);
            return res.status(400).json({ success: false, message: "Department name already exists" });
        }
        console.error(`[UpdateDept] Error updating department:`, error.message);
        console.error(`[UpdateDept] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to update department - Internal Server Error" });
    }
};

const deleteDept = async (req, res) => {
    const { id } = req.params;
    console.log(`[DeleteDept] Deleting department - ID: ${id}`);
    try {
        const query = "DELETE FROM departments WHERE id = ?";
        const [data] = await db.query(query, [id]);
        
        if (data.affectedRows === 0) {
            console.error(`[DeleteDept] Department not found - ID: ${id}`);
            return res.status(404).json({ success: false, message: "Department not found" });
        }

        console.log(`[DeleteDept] Success - Department deleted (ID: ${id})`);
        res.status(200).json({
            success: true,
            message: "Department deleted"
        });
    } catch (error) {
        console.error(`[DeleteDept] Error deleting department:`, error.message);
        console.error(`[DeleteDept] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to delete department - Internal Server Error" });
    }
};

module.exports = {
    getAllDept,
    getDept,
    addDept,
    updateDept,
    deleteDept
};