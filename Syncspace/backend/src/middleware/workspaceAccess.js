const workspaceModel = require('../models/workspaceModel');

/**
 * Ensures the authenticated user is a member of :workspaceId and
 * attaches the membership row (with role) to req.membership.
 */
async function requireWorkspaceMember(req, res, next) {
  try {
    const { workspaceId } = req.params;
    const membership = await workspaceModel.getMembership(workspaceId, req.user.id);

    if (!membership) {
      return res.status(403).json({ message: 'You do not have access to this workspace.' });
    }

    req.membership = membership;
    next();
  } catch (err) {
    next(err);
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.membership || !roles.includes(req.membership.role)) {
      return res.status(403).json({ message: 'You do not have permission to do that.' });
    }
    next();
  };
}

module.exports = { requireWorkspaceMember, requireRole };
