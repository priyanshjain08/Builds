const userModel = require('../models/userModel');
const taskModel = require('../models/taskModel');
const activityModel = require('../models/activityModel');
const workspaceModel = require('../models/workspaceModel');
const { isNonEmptyString } = require('../utils/validators');

async function updateProfile(req, res, next) {
  try {
    const { name, title, avatarColor } = req.body;
    if (name !== undefined && !isNonEmptyString(name, 120)) {
      return res.status(400).json({ message: 'Name cannot be empty.' });
    }
    const user = await userModel.updateProfile(req.user.id, { name, title, avatarColor });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

async function getProfileOverview(req, res, next) {
  try {
    const [tasks, activity, workspaces] = await Promise.all([
      taskModel.listAssignedToUser(req.user.id),
      activityModel.listForUserWorkspaces(req.user.id, 10),
      workspaceModel.listForUser(req.user.id),
    ]);
    res.json({ user: req.user, tasks, activity, workspaces });
  } catch (err) {
    next(err);
  }
}

async function searchUsers(req, res, next) {
  try {
    const q = (req.query.q || '').toString().trim();
    if (q.length < 2) return res.json({ users: [] });
    const users = await userModel.search(q, req.user.id);
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

module.exports = { updateProfile, getProfileOverview, searchUsers };
