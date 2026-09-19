const taskModel = require('../models/taskModel');
const projectModel = require('../models/projectModel');
const { logActivity } = require('../services/activityService');
const { notifyUser } = require('../services/notificationService');
const { isNonEmptyString, isOneOf } = require('../utils/validators');
const { getIO, workspaceRoom } = require('../sockets');

const STATUSES = ['todo', 'in_progress', 'in_review', 'completed'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', completed: 'Completed' };

async function createTask(req, res, next) {
  try {
    const { projectId, title, description, status, priority, assignedTo, dueDate } = req.body;

    if (!isNonEmptyString(title, 200)) {
      return res.status(400).json({ message: 'Task title is required.' });
    }
    if (status && !isOneOf(status, STATUSES)) {
      return res.status(400).json({ message: 'Invalid task status.' });
    }
    if (priority && !isOneOf(priority, PRIORITIES)) {
      return res.status(400).json({ message: 'Invalid task priority.' });
    }

    const project = await projectModel.findById(projectId);
    if (!project || project.workspace_id !== req.params.workspaceId) {
      return res.status(400).json({ message: 'That project does not belong to this workspace.' });
    }

    const task = await taskModel.create({
      projectId,
      workspaceId: req.params.workspaceId,
      title: title.trim(),
      description,
      status,
      priority,
      assignedTo,
      createdBy: req.user.id,
      dueDate,
    });
    const fullTask = await taskModel.findById(task.id);

    await logActivity({
      workspaceId: req.params.workspaceId,
      userId: req.user.id,
      type: 'task_created',
      description: `${req.user.name} created task "${task.title}" in ${project.name}`,
      metadata: { taskId: task.id, projectId },
    });

    if (assignedTo && assignedTo !== req.user.id) {
      await notifyUser({
        userId: assignedTo,
        type: 'task_assigned',
        content: `${req.user.name} assigned you "${task.title}"`,
        metadata: { taskId: task.id, workspaceId: req.params.workspaceId },
      });
    }

    getIO().to(workspaceRoom(req.params.workspaceId)).emit('task:created', fullTask);
    res.status(201).json({ task: fullTask });
  } catch (err) {
    next(err);
  }
}

async function listTasks(req, res, next) {
  try {
    const { projectId, search, status, priority, assignedTo, sort } = req.query;
    const tasks = await taskModel.listForWorkspace(req.params.workspaceId, {
      projectId,
      search,
      status,
      priority,
      assignedTo,
      sort,
    });
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
}

async function updateTask(req, res, next) {
  try {
    const existing = await taskModel.findById(req.params.taskId);
    if (!existing || existing.workspace_id !== req.params.workspaceId) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const { title, description, status, priority, assignedTo, dueDate, position } = req.body;
    if (status && !isOneOf(status, STATUSES)) {
      return res.status(400).json({ message: 'Invalid task status.' });
    }
    if (priority && !isOneOf(priority, PRIORITIES)) {
      return res.status(400).json({ message: 'Invalid task priority.' });
    }

    const statusChanged = status && status !== existing.status;
    const reassigned = assignedTo && assignedTo !== existing.assigned_to;

    await taskModel.update(req.params.taskId, {
      title,
      description,
      status,
      priority,
      assignedTo,
      dueDate,
      position,
    });
    const task = await taskModel.findById(req.params.taskId);

    if (statusChanged) {
      await logActivity({
        workspaceId: req.params.workspaceId,
        userId: req.user.id,
        type: 'task_status_changed',
        description: `${req.user.name} moved "${task.title}" to ${STATUS_LABELS[status]}`,
        metadata: { taskId: task.id },
      });
      if (task.assigned_to && task.assigned_to !== req.user.id) {
        await notifyUser({
          userId: task.assigned_to,
          type: 'task_updated',
          content: `"${task.title}" moved to ${STATUS_LABELS[status]}`,
          metadata: { taskId: task.id, workspaceId: req.params.workspaceId },
        });
      }
    }

    if (reassigned) {
      await logActivity({
        workspaceId: req.params.workspaceId,
        userId: req.user.id,
        type: 'task_assigned',
        description: `${req.user.name} assigned "${task.title}" to ${task.assignee_name}`,
        metadata: { taskId: task.id },
      });
      await notifyUser({
        userId: assignedTo,
        type: 'task_assigned',
        content: `${req.user.name} assigned you "${task.title}"`,
        metadata: { taskId: task.id, workspaceId: req.params.workspaceId },
      });
    }

    getIO().to(workspaceRoom(req.params.workspaceId)).emit('task:updated', task);
    res.json({ task });
  } catch (err) {
    next(err);
  }
}

async function deleteTask(req, res, next) {
  try {
    const existing = await taskModel.findById(req.params.taskId);
    if (!existing || existing.workspace_id !== req.params.workspaceId) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    await taskModel.remove(req.params.taskId);
    getIO().to(workspaceRoom(req.params.workspaceId)).emit('task:deleted', { id: req.params.taskId });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { createTask, listTasks, updateTask, deleteTask };
