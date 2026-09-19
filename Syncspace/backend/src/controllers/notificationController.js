const notificationModel = require('../models/notificationModel');

async function listNotifications(req, res, next) {
  try {
    const [notifications, unreadCount] = await Promise.all([
      notificationModel.listForUser(req.user.id),
      notificationModel.countUnread(req.user.id),
    ]);
    res.json({ notifications, unreadCount });
  } catch (err) {
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const notification = await notificationModel.markRead(req.params.notificationId, req.user.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found.' });
    res.json({ notification });
  } catch (err) {
    next(err);
  }
}

async function markAllRead(req, res, next) {
  try {
    await notificationModel.markAllRead(req.user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listNotifications, markRead, markAllRead };
