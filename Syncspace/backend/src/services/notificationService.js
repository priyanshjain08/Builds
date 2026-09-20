const notificationModel = require('../models/notificationModel');
const { getIO, userRoom } = require('../sockets');

/**
 * Creates a notification for a user and delivers it instantly if they're online.
 */
async function notifyUser({ userId, type, content, metadata }) {
  const notification = await notificationModel.create({ userId, type, content, metadata });
  try {
    getIO().to(userRoom(userId)).emit('notification:new', notification);
  } catch (err) {
    // Socket layer may not be initialized in some scripts/tests - notification is still persisted.
  }
  return notification;
}

module.exports = { notifyUser };
