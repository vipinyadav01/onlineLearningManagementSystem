const jwt = require('jsonwebtoken');

const adminMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    const errorResponses = {
      TokenExpiredError: { status: 401, message: 'Token has expired' },
      JsonWebTokenError: { status: 401, message: 'Invalid token' },
      NotBeforeError: { status: 401, message: 'Token not yet active' },
      default: { status: 500, message: 'Server error' }
    };
    const { status, message } = errorResponses[error.name] || errorResponses.default;
    return res.status(status).json({ success: false, message });
  }
};

module.exports = adminMiddleware;