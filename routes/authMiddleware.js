const jwt = require('jsonwebtoken');

// Middleware לאימות טוקן
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // מכיל את id ו-accountType
        next();
    } catch (err) {
        res.status(403).json({ message: 'Invalid token' });
    }
};


module.exports = { verifyToken };
