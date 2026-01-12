const db = require("../config/db.js");

const addStuDept = async (req, res) => {
    const stu_id = req.user.id;
    const { dept_id } = req.body;
    try {
        const query = "INSERT INTO stu_dept (stu_id, dept_id) VALUES (?, ?)";
        const [data] = await db.query(query, [stu_id, dept_id]);

        res.status(201).json({
            success: true,
            message: "Student assigned to department",
            data: data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const updateStuDept = async (req, res) => {
    const stu_id = req.user.id;
    const { dept_id } = req.body;
    try {
        const query = "UPDATE stu_dept SET dept_id = ? WHERE stu_id = ?";
        const [data] = await db.query(query, [dept_id, stu_id]);

        res.status(200).json({
            success: true,
            message: "Student department updated",
            data: data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const deleteStuDept = async (req, res) => {
    const stu_id = req.user.id;
    try {
        const query = "DELETE FROM stu_dept WHERE stu_id = ?";
        const [data] = await db.query(query, [stu_id]);

        res.status(200).json({
            success: true,
            message: "Student removed from department",
            data: data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = {
    addStuDept,
    updateStuDept,
    deleteStuDept
};