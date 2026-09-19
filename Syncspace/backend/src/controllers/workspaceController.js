const workspaceModel = require('../models/workspaceModel');
const userModel = require('../models/userModel');
const projectModel = require('../models/projectModel');
const taskModel = require('../models/taskModel');
const activityModel = require('../models/activityModel');
const { logActivity } = require('../services/activityService');
const { notifyUser } = require('../services/notificationService');
const { isNonEmptyString } = require('../utils/validators');
const { getIO, workspaceRoom, getOnlineUserIdsInWorkspace } = require('../sockets');

async function createWorkspace(req, res, next) {
  try {
    const { name, description } = req.body;
    if (!isNonEmptyString(name, 160)) {
      return res.status(400).json({ message: 'Workspace name is required.' });
    }
    const workspace = await workspaceModel.create({ name: name.trim(), description, ownerId: req.user.id });
    await logActivity({
      workspaceId: workspace.id,
      userId: req.user.id,
      type: 'workspace_created',
      description: `${req.user.name} created the workspace`,
    });
    res.status(201).json({ workspace });
  } catch (err) {
    next(err);
  }
}

async function listMyWorkspaces(req, res, next) {
  try {
    const workspaces = await workspaceModel.listForUser(req.user.id);
    res.json({ workspaces });
  } catch (err) {
    next(err);
  }
}

async function getWorkspace(req, res, next) {
  try {
    const workspace = await workspaceModel.findById(req.params.workspaceId);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found.' });

    const [members, projects, activity] = await Promise.all([
      workspaceModel.listMembers(workspace.id),
      projectModel.listForWorkspace(workspace.id),
      activityModel.listForWorkspace(workspace.id, 15),
    ]);

    let onlineUserIds = [];
    try {
      onlineUserIds = getOnlineUserIdsInWorkspace(getIO(), workspace.id);
    } catch (err) {
      /* socket layer not ready */
    }

    res.json({ workspace, members, projects, activity, myRole: req.membership.role, onlineUserIds });
  } catch (err) {
    next(err);
  }
}

async function updateWorkspace(req, res, next) {
  try {
    const { name, description } = req.body;
    const workspace = await workspaceModel.update(req.params.workspaceId, { name, description });
    await logActivity({
      workspaceId: workspace.id,
      userId: req.user.id,
      type: 'workspace_updated',
      description: `${req.user.name} updated the workspace details`,
    });
    getIO().to(workspaceRoom(workspace.id)).emit('workspace:updated', workspace);
    res.json({ workspace });
  } catch (err) {
    next(err);
  }
}

async function deleteWorkspace(req, res, next) {
  try {
    await workspaceModel.remove(req.params.workspaceId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function listMembers(req, res, next) {
  try {
    const members = await workspaceModel.listMembers(req.params.workspaceId);
    res.json({ members });
  } catch (err) {
    next(err);
  }
}

async function addMember(req, res, next) {
  try {
    const { email } = req.body;
    if (!isNonEmptyString(email, 255)) {
      return res.status(400).json({ message: 'Please provide the email of a registered user.' });
    }
    const targetUser = await userModel.findByEmail(email.trim().toLowerCase());
    if (!targetUser) {
      return res.status(404).json({ message: 'No registered user found with that email.' });
    }

    const existing = await workspaceModel.getMembership(req.params.workspaceId, targetUser.id);
    if (existing) {
      return res.status(409).json({ message: 'That user is already a member of this workspace.' });
    }

    const membership = await workspaceModel.addMember(req.params.workspaceId, targetUser.id);
    const workspace = await workspaceModel.findById(req.params.workspaceId);

    await logActivity({
      workspaceId: workspace.id,
      userId: req.user.id,
      type: 'member_added',
      description: `${req.user.name} added ${targetUser.name} to the workspace`,
    });
    await notifyUser({
      userId: targetUser.id,
      type: 'workspace_invite',
      content: `${req.user.name} added you to "${workspace.name}"`,
      metadata: { workspaceId: workspace.id },
    });

    getIO().to(workspaceRoom(workspace.id)).emit('member:added', {
      id: targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
      avatar_color: targetUser.avatar_color,
      title: targetUser.title,
      role: membership.role,
      joined_at: membership.joined_at,
    });

    res.status(201).json({ member: targetUser });
  } catch (err) {
    next(err);
  }
}

async function removeMember(req, res, next) {
  try {
    const { userId } = req.params;
    await workspaceModel.removeMember(req.params.workspaceId, userId);
    getIO().to(workspaceRoom(req.params.workspaceId)).emit('member:removed', { userId });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function getActivity(req, res, next) {
  try {
    const activity = await activityModel.listForWorkspace(req.params.workspaceId, 50);
    res.json({ activity });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createWorkspace,
  listMyWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  listMembers,
  addMember,
  removeMember,
  getActivity,
};
