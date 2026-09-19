const { verifyToken } = require('../utils/jwt');
const userModel = require('../models/userModel');

/**
 * Requires a valid JWT in the Authorization header.
 * Attaches the authenticated user (without password hash) to req.user.
 */
async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Not authenticated. Please log in.' });
    }

    const payload = verifyToken(token);
    const user = await userModel.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ message: 'Account no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Session expired. Please log in again.' });
  }
}

module.exports = { protect };
