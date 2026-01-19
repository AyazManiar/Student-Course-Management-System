const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        console.log(`[AuthMiddleware] No token found in request`);
        return res.status(401).json({ success: false, message: "Unauthorized: Token not found" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            console.log(`[AuthMiddleware] Token verification failed`);
            return res.status(401).json({ success: false, message: "User is not logged in" });
        }
        req.user = decoded;
        console.log(`[AuthMiddleware] User authenticated - ID: ${decoded.id}, Role: ${decoded.role}`);
        next();
    } catch (error) {
        console.error(`[AuthMiddleware] Token validation error:`, error.message);
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            console.log(`[AuthorizeRoles] Access denied - User role: ${req.user?.role}, Required: ${roles.join(', ')}`);           
            return res.status(403).json({ 
                success: false, 
                message: "Access denied: Insufficient permissions" 
            });
        }
        console.log(`[AuthorizeRoles] Role authorized - User: ${req.user.id}, Role: ${req.user.role}`);
        next();
    };
};

module.exports = { authMiddleware, authorizeRoles };