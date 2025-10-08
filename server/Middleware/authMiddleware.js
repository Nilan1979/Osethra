const jwt = require('jsonwebtoken');
const User = require('../Model/UserModel');

/**
 * Middleware to verify JWT token
 * Extracts token from Authorization header and verifies it
 * Attaches user data to req.user for use in protected routes
 */
exports.authenticate = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false,
                message: 'Authentication required. Please provide a valid token.' 
            });
        }

        // Extract token
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Authentication token not found.' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
        
        // Get user from database (excluding password)
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'User not found. Token may be invalid.' 
            });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid token. Please login again.' 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token expired. Please login again.' 
            });
        }
        
        res.status(500).json({ 
            success: false,
            message: 'Authentication error.',
            error: error.message 
        });
    }
};

/**
 * Middleware factory to restrict access based on user roles
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 * @returns Middleware function
 * 
 * Usage: authorize('admin', 'pharmacist')
 */
exports.authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: 'Authentication required.' 
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                message: `Access denied. This action requires one of the following roles: ${allowedRoles.join(', ')}`,
                userRole: req.user.role
            });
        }

        next();
    };
};

/**
 * Middleware to restrict inventory management to pharmacists and admins
 * Common use case for inventory operations
 */
exports.requirePharmacistOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            success: false,
            message: 'Authentication required.' 
        });
    }

    const allowedRoles = ['pharmacist', 'admin'];
    
    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
            success: false,
            message: 'Access denied. Only pharmacists and administrators can perform inventory operations.',
            userRole: req.user.role
        });
    }

    next();
};

/**
 * Middleware to allow read access to multiple roles but write access only to pharmacists/admins
 * @param {boolean} isWriteOperation - True for POST/PUT/PATCH/DELETE, false for GET
 */
exports.inventoryAccess = (isWriteOperation = false) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: 'Authentication required.' 
            });
        }

        // Read access: pharmacist, admin, doctor, nurse
        const readRoles = ['pharmacist', 'admin', 'doctor', 'nurse'];
        
        // Write access: only pharmacist and admin
        const writeRoles = ['pharmacist', 'admin'];
        
        const allowedRoles = isWriteOperation ? writeRoles : readRoles;
        
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                message: `Access denied. ${isWriteOperation ? 'Modification' : 'Access'} requires one of these roles: ${allowedRoles.join(', ')}`,
                userRole: req.user.role
            });
        }

        next();
    };
};
