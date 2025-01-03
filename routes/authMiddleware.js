const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach decoded user data to req.user
        console.log("User decoded from token:", req.user);  // Debug log
        next();
    } catch (err) {
        console.error("Token verification failed:", err);
        res.status(403).json({ message: 'Invalid or expired token' });
    }
};

// Middleware to check if the user has Admin role
const verifyAdmin = (req, res, next) => {
    if (req.user.accountType !== 'Admin') {
        return res.status(403).json({ message: 'Access denied. Admins only' }); // Only allow admins to proceed
    }
    next();  // Continue if the user is an Admin
};

module.exports = { verifyToken, verifyAdmin };
