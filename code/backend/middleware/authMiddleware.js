import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const protect = async (req, res, next) => {
  let token;

  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.userId).select('-password');

      next();
    } catch (error) {
      res.status(401);
      res.json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401);
    res.json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403);
    res.json({ message: 'Not authorized as an admin' });
  }
};

const agentOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'Agent' || req.user.role === 'Admin')) {
    next();
  } else {
    res.status(403);
    res.json({ message: 'Not authorized as an agent or admin' });
  }
};

export { protect, admin, agentOrAdmin };