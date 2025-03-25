const User = require('../models/User');

exports.getUserLogins = async (req, res) => {
  try {
    const users = await User.find()
      .select('name lastLogin')
      .sort({ lastLogin: -1 })
      .limit(50);

    const logins = users
      .filter(user => user.lastLogin)
      .map(user => ({
        id: user._id,
        username: user.name,
        lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
      }));

    res.json(logins);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user logins', error: error.message });
  }
};

exports.getUserEnrollments = async (req, res) => {
  try {
    const users = await User.find()
      .populate('enrollments.courseId', 'title')
      .sort({ 'enrollments.date': -1 });

    const enrollments = users
      .filter(user => user.enrollments.length > 0)
      .flatMap(user =>
        user.enrollments.map(enrollment => ({
          id: enrollment._id,
          username: user.name,
          course: enrollment.courseId ? enrollment.courseId.title : 'Unknown Course',
          date: enrollment.date.toISOString(),
        }))
      );

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching enrollments', error: error.message });
  }
};