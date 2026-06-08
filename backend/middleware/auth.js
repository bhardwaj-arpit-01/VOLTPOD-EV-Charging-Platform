const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  // Get token from header
  const token = req.header('Authorization')?.split(' ')[1];

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ msg: 'Not authorized as an admin' });
  }
};

const operator = (req, res, next) => {
  if (req.user && (req.user.role === 'operator' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ msg: 'Not authorized as an operator' });
  }
};

module.exports = { auth, admin, operator };