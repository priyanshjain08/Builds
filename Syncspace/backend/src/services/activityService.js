const activityModel = require('../models/activityModel');
const { getIO, workspaceRoom } = require('../sockets');

/**
 * Records an activity row and pushes it live to everyone viewing the workspace.
 */
async function logActivity({ workspaceId, userId, type, description, metadata }) {
  const activity = await activityModel.create({ workspaceId, userId, type, description, metadata });
  try {
    getIO().to(workspaceRoom(workspaceId)).emit('activity:new', activity);
  } catch (err) {
    // Socket layer may not be initialized in some scripts/tests - activity is still persisted.
  }
  return activity;
}

module.exports = { logActivity };
