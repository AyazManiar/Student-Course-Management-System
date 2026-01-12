const db = require("../config/db.js");

// Get all admins
const getAllAdmins = async (req, res) => {
    try {
        const query = `SELECT a.id, a.name, au.email, a.created_at 
                        FROM admins a JOIN auth_users au ON a.id = au.id`;
        const [data] = await db.query(query);
        
        res.status(200).json({
            success: true,
            message: "Fetched all admins",
            data: data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Get specific admin
const getAdmin = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `SELECT a.id, a.name, au.email, a.created_at 
                        FROM admins a JOIN auth_users au ON a.id = au.id 
                        WHERE a.id = ?`;
        const [data] = await db.query(query, [id]);
        
        if (data.length === 0) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        res.status(200).json({
            success: true,
            message: "Fetched admin",
            data: data[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Get my profile (for logged-in admin)
const getMyProfile = async (req, res) => {
    const admin_id = req.user.id;
    try {
        const query = `SELECT a.id, a.name, au.email, a.created_at 
                        FROM admins a JOIN auth_users au ON a.id = au.id 
                        WHERE a.id = ?`;
        const [data] = await db.query(query, [admin_id]);
        
        if (data.length === 0) {
            return res.status(404).json({ success: false, message: "Admin not found" });
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

// Update admin profile
const updateAdmin = async (req, res) => {
    const admin_id = req.user.id;
    const { name } = req.body;
    
    try {
        if (!name) {
            return res.status(400).json({ success: false, message: "Name is required" });
        }

        await db.query("UPDATE admins SET name = ? WHERE id = ?", [name, admin_id]);

        res.status(200).json({
            success: true,
            message: "Admin profile updated"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Delete admin (super admin only - in production, add more checks)
// const deleteAdmin = async (req, res) => {
//     const { id } = req.params;
//     try {
//         // Prevent deleting self
//         if (parseInt(id) === req.user.id) {
//             return res.status(400).json({ success: false, message: "Cannot delete your own account" });
//         }

//         // This will cascade delete from admins table due to foreign key
//         await db.query("DELETE FROM auth_users WHERE id = ? AND role = 'admin'", [id]);
        
//         res.status(200).json({
//             success: true,
//             message: "Admin deleted"
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// };

// Get system statistics (admin dashboard)
const getSystemStats = async (req, res) => {
    try {
        const [studentCount] = await db.query("SELECT COUNT(*) as count FROM students");
        const [teacherCount] = await db.query("SELECT COUNT(*) as count FROM teachers");
        const [courseCount] = await db.query("SELECT COUNT(*) as count FROM courses");
        const [departmentCount] = await db.query("SELECT COUNT(*) as count FROM departments");
        const [enrollmentCount] = await db.query("SELECT COUNT(*) as count FROM enrollments");

        res.status(200).json({
            success: true,
            message: "Fetched system statistics",
            data: {
                students: studentCount[0].count,
                teachers: teacherCount[0].count,
                courses: courseCount[0].count,
                departments: departmentCount[0].count,
                enrollments: enrollmentCount[0].count
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = {
    getAllAdmins,
    getAdmin,
    getMyProfile,
    updateAdmin,
    deleteAdmin,
    getSystemStats
};
