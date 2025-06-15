const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'NO_TOKEN_PROVIDED'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('_id email role');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists',
        code: 'USER_NOT_FOUND'
      });
    }
    req.user = { id: user._id, email: user.email, role: user.role || 'user' };
    next();
  } catch (error) {
    console.error('Authentication error:', {
      error: error.name,
      message: error.message
    });
    const responses = {
      TokenExpiredError: { status: 401, message: 'Authentication token has expired', code: 'TOKEN_EXPIRED' },
      JsonWebTokenError: { status: 401, message: 'Invalid authentication token', code: 'INVALID_TOKEN' },
      NotBeforeError: { status: 401, message: 'Token not yet active', code: 'TOKEN_NOT_ACTIVE' },
      default: { status: 500, message: 'Internal server error during authentication', code: 'SERVER_ERROR' }
    };
    const { status, message, code } = responses[error.name] || responses.default;
    res.status(status).json({ success: false, message, code });
  }
};

module.exports = authMiddleware;