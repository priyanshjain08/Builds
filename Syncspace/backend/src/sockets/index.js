const { Server } = require('socket.io');
const { verifyToken } = require('../utils/jwt');
const userModel = require('../models/userModel');
const workspaceModel = require('../models/workspaceModel');

let ioInstance = null;

function workspaceRoom(workspaceId) {
  return `workspace:${workspaceId}`;
}

function userRoom(userId) {
  return `user:${userId}`;
}

/** Returns the distinct user ids currently connected to a workspace room. */
function getOnlineUserIdsInWorkspace(io, workspaceId) {
  const room = io.sockets.adapter.rooms.get(workspaceRoom(workspaceId));
  if (!room) return [];
  const userIds = new Set();
  room.forEach((socketId) => {
    const s = io.sockets.sockets.get(socketId);
    if (s && s.user) userIds.add(s.user.id);
  });
  return Array.from(userIds);
}

function broadcastPresence(io, workspaceId) {
  io.to(workspaceRoom(workspaceId)).emit('presence:update', {
    workspaceId,
    onlineUserIds: getOnlineUserIdsInWorkspace(io, workspaceId),
  });
}

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Authenticate every socket connection using the same JWT used for the REST API.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No auth token provided'));
      const payload = verifyToken(token);
      const user = await userModel.findById(payload.sub);
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid or expired session'));
    }
  });

  io.on('connection', (socket) => {
    socket.data.workspaceRooms = new Set();
    socket.join(userRoom(socket.user.id));

    socket.on('workspace:join', async (workspaceId) => {
      try {
        const membership = await workspaceModel.getMembership(workspaceId, socket.user.id);
        if (!membership) return; // silently ignore unauthorized join attempts
        socket.join(workspaceRoom(workspaceId));
        socket.data.workspaceRooms.add(workspaceId);
        broadcastPresence(io, workspaceId);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('workspace:join error', err.message);
      }
    });

    socket.on('workspace:leave', (workspaceId) => {
      socket.leave(workspaceRoom(workspaceId));
      socket.data.workspaceRooms.delete(workspaceId);
      broadcastPresence(io, workspaceId);
    });

    socket.on('chat:typing', ({ workspaceId, isTyping }) => {
      socket.to(workspaceRoom(workspaceId)).emit('chat:typing', {
        userId: socket.user.id,
        name: socket.user.name,
        isTyping,
      });
    });

    socket.on('disconnect', () => {
      const rooms = Array.from(socket.data.workspaceRooms || []);
      // Small delay lets socket.io finish removing this socket from room adapters first.
      setImmediate(() => rooms.forEach((workspaceId) => broadcastPresence(io, workspaceId)));
    });
  });

  ioInstance = io;
  return io;
}

function getIO() {
  if (!ioInstance) throw new Error('Socket.IO has not been initialized yet');
  return ioInstance;
}

module.exports = {
  initSocket,
  getIO,
  workspaceRoom,
  userRoom,
  getOnlineUserIdsInWorkspace,
};
