const db = require("../config/db.js");

// Get all admins
const getAllAdmins = async (req, res) => {
    console.log(`[GetAllAdmins] Fetching all admins`);
    try {
        const query = `SELECT a.id, a.name, au.email, a.created_at 
                        FROM admins a JOIN auth_users au ON a.id = au.id`;
        const [data] = await db.query(query);
        console.log(`[GetAllAdmins] Found ${data.length} admins`);
        
        res.status(200).json({
            success: true,
            message: "Fetched all admins",
            data: data
        });
    } catch (error) {
        console.error(`[GetAllAdmins] Error fetching admins:`, error.message);
        console.error(`[GetAllAdmins] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to fetch admins - Internal Server Error" });
    }
};

// Get specific admin
const getAdmin = async (req, res) => {
    const { id } = req.params;
    console.log(`[GetAdmin] Fetching admin - ID: ${id}`);
    try {
        const query = `SELECT a.id, a.name, au.email, a.created_at 
                        FROM admins a JOIN auth_users au ON a.id = au.id 
                        WHERE a.id = ?`;
        const [data] = await db.query(query, [id]);
        
        if (data.length === 0) {
            console.log(`[GetAdmin] Admin not found - ID: ${id}`);
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        console.log(`[GetAdmin] Success - Admin found: ${data[0].name}`);
        res.status(200).json({
            success: true,
            message: "Fetched admin",
            data: data[0]
        });
    } catch (error) {
        console.error(`[GetAdmin] Error fetching admin:`, error.message);
        console.error(`[GetAdmin] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to fetch admin - Internal Server Error" });
    }
};

// Get my profile (for logged-in admin)
const getMyProfile = async (req, res) => {
    const admin_id = req.user.id;
    console.log(`[GetMyProfile-Admin] Fetching profile - Admin ID: ${admin_id}`);
    try {
        const query = `SELECT a.id, a.name, au.email, a.created_at 
                        FROM admins a JOIN auth_users au ON a.id = au.id 
                        WHERE a.id = ?`;
        const [data] = await db.query(query, [admin_id]);
        
        if (data.length === 0) {
            console.error(`[GetMyProfile-Admin] Admin profile not found - ID: ${admin_id}`);
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        console.log(`[GetMyProfile-Admin] Success - Admin: ${data[0].name}`);
        res.status(200).json({
            success: true,
            message: "Fetched profile",
            data: data[0]
        });
    } catch (error) {
        console.error(`[GetMyProfile-Admin] Error fetching profile:`, error.message);
        console.error(`[GetMyProfile-Admin] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to fetch profile - Internal Server Error" });
    }
};

// Update admin profile
const updateAdmin = async (req, res) => {
    const admin_id = req.user.id;
    const { name } = req.body;
    console.log(`[UpdateAdmin] Updating admin - ID: ${admin_id}, New Name: ${name}`);
    
    try {
        if (!name) {
            console.log(`[UpdateAdmin] Validation failed - Name is required`);
            return res.status(400).json({ success: false, message: "Name is required" });
        }

        const [result] = await db.query("UPDATE admins SET name = ? WHERE id = ?", [name, admin_id]);
        
        if (result.affectedRows === 0) {
            console.error(`[UpdateAdmin] Admin not found - ID: ${admin_id}`);
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        console.log(`[UpdateAdmin] Success - Admin updated: ${name}`);
        res.status(200).json({
            success: true,
            message: "Admin profile updated"
        });
    } catch (error) {
        console.error(`[UpdateAdmin] Error updating admin:`, error.message);
        console.error(`[UpdateAdmin] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to update admin - Internal Server Error" });
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
    console.log(`[GetSystemStats] Fetching system statistics`);
    // Future enhancements: Even if some table is not fetched,
    // it should still provide the remaining data and the again fetches only required data
    try {
        console.log(`[GetSystemStats] Querying counts from all tables`);
        const [studentCount] = await db.query("SELECT COUNT(*) as count FROM students");
        const [teacherCount] = await db.query("SELECT COUNT(*) as count FROM teachers");
        const [courseCount] = await db.query("SELECT COUNT(*) as count FROM courses");
        const [departmentCount] = await db.query("SELECT COUNT(*) as count FROM departments");
        const [enrollmentCount] = await db.query("SELECT COUNT(*) as count FROM enrollments");

        const stats = {
            students: studentCount[0].count,
            teachers: teacherCount[0].count,
            courses: courseCount[0].count,
            departments: departmentCount[0].count,
            enrollments: enrollmentCount[0].count
        };
        
        console.log(`[GetSystemStats] Success - Stats:`, stats);
        res.status(200).json({
            success: true,
            message: "Fetched system statistics",
            data: stats
        });
    } catch (error) {
        console.error(`[GetSystemStats] Error fetching statistics:`, error.message);
        console.error(`[GetSystemStats] Stack:`, error.stack);
        res.status(500).json({ success: false, message: "Failed to fetch statistics - Internal Server Error" });
    }
};

module.exports = {
    getAllAdmins,
    getAdmin,
    getMyProfile,
    updateAdmin,
    // deleteAdmin,
    getSystemStats
};
