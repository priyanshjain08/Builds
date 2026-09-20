const express = require('express');
const {
  createWorkspace,
  listMyWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  listMembers,
  addMember,
  removeMember,
  getActivity,
} = require('../controllers/workspaceController');
const { protect } = require('../middleware/authMiddleware');
const { requireWorkspaceMember, requireRole } = require('../middleware/workspaceAccess');

const projectRoutes = require('./projectRoutes');
const taskRoutes = require('./taskRoutes');
const messageRoutes = require('./messageRoutes');

const router = express.Router();
router.use(protect);

router.get('/', listMyWorkspaces);
router.post('/', createWorkspace);

// Everything below requires the user to be a member of :workspaceId
router.get('/:workspaceId', requireWorkspaceMember, getWorkspace);
router.patch('/:workspaceId', requireWorkspaceMember, requireRole('owner', 'admin'), updateWorkspace);
router.delete('/:workspaceId', requireWorkspaceMember, requireRole('owner'), deleteWorkspace);

router.get('/:workspaceId/members', requireWorkspaceMember, listMembers);
router.post('/:workspaceId/members', requireWorkspaceMember, requireRole('owner', 'admin'), addMember);
router.delete('/:workspaceId/members/:userId', requireWorkspaceMember, requireRole('owner', 'admin'), removeMember);

router.get('/:workspaceId/activity', requireWorkspaceMember, getActivity);

router.use('/:workspaceId/projects', requireWorkspaceMember, projectRoutes);
router.use('/:workspaceId/tasks', requireWorkspaceMember, taskRoutes);
router.use('/:workspaceId/messages', requireWorkspaceMember, messageRoutes);

module.exports = router;
