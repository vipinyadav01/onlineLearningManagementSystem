const jwt = require('jsonwebtoken');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;
const bcrypt = require('bcryptjs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const generateAccessToken = (id, expiresIn = '1h') => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn,
    issuer: 'TechBit Academy',
    algorithm: 'HS256',
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '90d',
    issuer: 'TechBit Academy',
    algorithm: 'HS256',
  });
};

// Signup Controller
const signup = async (req, res) => {
  try {
    const { name, email, password, profilePic } = req.body;
    if (!name || name.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters long',
      });
    }
    if (!/^[A-Za-z\s]+$/.test(name)) {
      return res.status(400).json({
        success: false,
        message: 'Name must contain only letters and spaces, no numbers',
      });
    }

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    const sanitizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: sanitizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }
    const user = new User({
      name: name.trim(),
      email: sanitizedEmail,
      password, 
      profilePic: null,
    });

    if (profilePic) {
      try {
        const cloudinaryResponse = await cloudinary.uploader.upload(profilePic, {
          folder: 'user_profiles',
          transformation: [{ width: 500, height: 500, crop: 'limit' }],
        });
        user.profilePic = cloudinaryResponse.secure_url;
      } catch (cloudinaryError) {
        console.error('Cloudinary Upload Error:', cloudinaryError);
      }
    }

    await user.save();
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        accessToken,
        refreshToken,
      },
      message: 'Registration successful',
    });
  } catch (error) {
    console.error('Detailed Signup Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      details: error.errors,
    });

    res.status(500).json({
      success: false,
      message: 'Server error during signup',
      errorType: error.name,
      errorMessage: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred',
    });
  }
};

// Login Controller
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const sanitizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: sanitizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is not active',
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.lastLogin = new Date();
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        isAdmin: user.isAdmin,
        accessToken,
        refreshToken,
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Refresh Token Controller
const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token required',
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    }

    const newAccessToken = generateAccessToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: user.refreshToken,
      },
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
    });
  }
};

// Verify Token Controller
const verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        isValid: false,
        message: 'Invalid or inactive user',
      });
    }

    res.status(200).json({
      success: true,
      isValid: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        isAdmin: user.isAdmin || false,
      },
      message: 'Token is valid',
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      isValid: false,
      message: 'Invalid or expired token',
    });
  }
};

// Logout Controller
const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout',
    });
  }
};

// Get Current User
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found or deactivated',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving user',
    });
  }
};

// Update Profile
const updateProfile = async (req, res) => {
  try {
    const { name, profilePic } = req.body;
    const user = await User.findById(req.user.id);

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found or deactivated',
      });
    }

    if (name) user.name = name.trim();
    if (profilePic) {
      try {
        const cloudinaryResponse = await cloudinary.uploader.upload(profilePic, {
          folder: 'user_profiles',
          transformation: [{ width: 500, height: 500, crop: 'limit' }],
        });
        user.profilePic = cloudinaryResponse.secure_url;
      } catch (cloudinaryError) {
        console.error('Cloudinary Upload Error:', cloudinaryError);
        return res.status(500).json({
          success: false,
          message: 'Error uploading profile picture',
        });
    }
    }
    if (name && name.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters long',
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
    });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current and new passwords are required',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long',
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found or deactivated',
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword; 
    await user.save();

    res.status(200).json({
      success: false,
      message: 'Password reset successful',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
    });
  }
};

module.exports = {
  signup,
  login,
  refreshToken,
  verifyToken,
  logout,
  getMe,
  updateProfile,
  resetPassword,
};