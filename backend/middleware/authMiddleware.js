const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      error: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.id }).select('_id email role');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed',
        error: 'User no longer exists'
      });
    }

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role || 'user'
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    const errorResponses = {
      TokenExpiredError: {
        status: 401,
        message: 'Authentication token has expired'
      },
      JsonWebTokenError: {
        status: 401,
        message: 'Invalid authentication token'
      },
      NotBeforeError: {
        status: 401,
        message: 'Token not yet active'
      },
      default: {
        status: 500,
        message: 'Internal server error during authentication'
      }
    };

    const errorResponse = errorResponses[error.name] || errorResponses.default;
    res.status(errorResponse.status).json({
      success: false,
      message: 'Authentication failed',
      error: errorResponse.message
    });
  }
};

module.exports = authMiddleware;
