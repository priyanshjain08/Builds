const express = require('express');
const {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');

// mergeParams so :workspaceId from the parent router is available here
const router = express.Router({ mergeParams: true });

router.get('/', listProjects);
router.post('/', createProject);
router.get('/:projectId', getProject);
router.patch('/:projectId', updateProject);
router.delete('/:projectId', deleteProject);

module.exports = router;
