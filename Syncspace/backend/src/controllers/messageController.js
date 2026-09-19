const messageModel = require('../models/messageModel');
const { isNonEmptyString } = require('../utils/validators');
const { getIO, workspaceRoom } = require('../sockets');

async function listMessages(req, res, next) {
  try {
    const { before, limit } = req.query;
    const messages = await messageModel.listForWorkspace(req.params.workspaceId, {
      before,
      limit: limit ? Number(limit) : 50,
    });
    res.json({ messages });
  } catch (err) {
    next(err);
  }
}

async function sendMessage(req, res, next) {
  try {
    const { content } = req.body;
    if (!isNonEmptyString(content, 4000)) {
      return res.status(400).json({ message: 'Message cannot be empty.' });
    }

    const saved = await messageModel.create({
      workspaceId: req.params.workspaceId,
      userId: req.user.id,
      content: content.trim(),
    });

    const fullMessage = {
      ...saved,
      sender_name: req.user.name,
      sender_color: req.user.avatar_color,
    };

    getIO().to(workspaceRoom(req.params.workspaceId)).emit('chat:message', fullMessage);
    res.status(201).json({ message: fullMessage });
  } catch (err) {
    next(err);
  }
}

module.exports = { listMessages, sendMessage };
