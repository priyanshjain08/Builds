const projectModel = require('../models/projectModel');
const taskModel = require('../models/taskModel');
const { logActivity } = require('../services/activityService');
const { isNonEmptyString, isOneOf } = require('../utils/validators');
const { getIO, workspaceRoom } = require('../sockets');

const STATUSES = ['planning', 'active', 'on_hold', 'completed'];

async function createProject(req, res, next) {
  try {
    const { name, description, status } = req.body;
    if (!isNonEmptyString(name, 160)) {
      return res.status(400).json({ message: 'Project name is required.' });
    }
    if (status && !isOneOf(status, STATUSES)) {
      return res.status(400).json({ message: 'Invalid project status.' });
    }

    const project = await projectModel.create({
      workspaceId: req.params.workspaceId,
      name: name.trim(),
      description,
      status,
      createdBy: req.user.id,
    });

    await logActivity({
      workspaceId: project.workspace_id,
      userId: req.user.id,
      type: 'project_created',
      description: `${req.user.name} created project "${project.name}"`,
      metadata: { projectId: project.id },
    });

    getIO().to(workspaceRoom(project.workspace_id)).emit('project:created', project);
    res.status(201).json({ project });
  } catch (err) {
    next(err);
  }
}

async function listProjects(req, res, next) {
  try {
    const { search, status } = req.query;
    const projects = await projectModel.listForWorkspace(req.params.workspaceId, { search, status });
    res.json({ projects });
  } catch (err) {
    next(err);
  }
}

async function getProject(req, res, next) {
  try {
    const project = await projectModel.findById(req.params.projectId);
    if (!project || project.workspace_id !== req.params.workspaceId) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    const tasks = await taskModel.listForWorkspace(req.params.workspaceId, { projectId: project.id });
    res.json({ project, tasks });
  } catch (err) {
    next(err);
  }
}

async function updateProject(req, res, next) {
  try {
    const { name, description, status } = req.body;
    if (status && !isOneOf(status, STATUSES)) {
      return res.status(400).json({ message: 'Invalid project status.' });
    }
    const project = await projectModel.update(req.params.projectId, { name, description, status });
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    await logActivity({
      workspaceId: project.workspace_id,
      userId: req.user.id,
      type: 'project_updated',
      description: `${req.user.name} updated project "${project.name}"`,
      metadata: { projectId: project.id },
    });

    getIO().to(workspaceRoom(project.workspace_id)).emit('project:updated', project);
    res.json({ project });
  } catch (err) {
    next(err);
  }
}

async function deleteProject(req, res, next) {
  try {
    const project = await projectModel.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    await projectModel.remove(req.params.projectId);
    getIO().to(workspaceRoom(project.workspace_id)).emit('project:deleted', { id: project.id });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { createProject, listProjects, getProject, updateProject, deleteProject };
