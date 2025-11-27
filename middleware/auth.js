const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

// Middleware to verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided or invalid format'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    
    // Verify user still exists
    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Attach user info to request
    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

// Middleware to check if user is an organizer
const requireOrganizer = (req, res, next) => {
  if (req.user.role !== 'organizer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Organizer role required.'
    });
  }
  next();
};

module.exports = {
  authenticate,
  requireOrganizer
};

