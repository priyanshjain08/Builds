const db = require('../config/db');
const workspaceModel = require('../models/workspaceModel');
const taskModel = require('../models/taskModel');
const activityModel = require('../models/activityModel');

async function getDashboard(req, res, next) {
  try {
    const userId = req.user.id;

    const workspaces = await workspaceModel.listForUser(userId);
    const workspaceIds = workspaces.map((w) => w.id);

    let activeProjects = 0;
    if (workspaceIds.length) {
      const { rows } = await db.query(
        `SELECT COUNT(*) FROM projects WHERE workspace_id = ANY($1::uuid[]) AND status = 'active'`,
        [workspaceIds]
      );
      activeProjects = Number(rows[0].count);
    }

    const [myTasks, dueSoon, activity] = await Promise.all([
      taskModel.listAssignedToUser(userId),
      taskModel.listAssignedToUser(userId, { dueSoonDays: 7 }),
      activityModel.listForUserWorkspaces(userId, 12),
    ]);

    res.json({
      stats: {
        totalWorkspaces: workspaces.length,
        activeProjects,
        myOpenTasks: myTasks.length,
        tasksDueSoon: dueSoon.length,
      },
      workspaces,
      myTasks: myTasks.slice(0, 8),
      tasksDueSoon: dueSoon.slice(0, 8),
      activity,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard };
