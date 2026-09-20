const db = require('../config/db');

const TASK_SELECT = `
  t.*,
  au.name AS assignee_name, au.avatar_color AS assignee_color,
  cu.name AS creator_name,
  p.name AS project_name
`;

async function create({ projectId, workspaceId, title, description, status, priority, assignedTo, createdBy, dueDate }) {
  const { rows } = await db.query(
    `INSERT INTO tasks (project_id, workspace_id, title, description, status, priority, assigned_to, created_by, due_date)
     VALUES ($1, $2, $3, $4, COALESCE($5, 'todo'), COALESCE($6, 'medium'), $7, $8, $9)
     RETURNING *`,
    [projectId, workspaceId, title, description || null, status, priority, assignedTo || null, createdBy, dueDate || null]
  );
  return rows[0];
}

async function findById(id) {
  const { rows } = await db.query(
    `SELECT ${TASK_SELECT} FROM tasks t
     LEFT JOIN users au ON au.id = t.assigned_to
     LEFT JOIN users cu ON cu.id = t.created_by
     LEFT JOIN projects p ON p.id = t.project_id
     WHERE t.id = $1`,
    [id]
  );
  return rows[0] || null;
}

/**
 * List + search/filter/sort tasks for a workspace (optionally scoped to a project).
 */
async function listForWorkspace(workspaceId, { projectId, search, status, priority, assignedTo, sort } = {}) {
  const conditions = ['t.workspace_id = $1'];
  const params = [workspaceId];

  if (projectId) {
    params.push(projectId);
    conditions.push(`t.project_id = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`t.title ILIKE $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`t.status = $${params.length}`);
  }
  if (priority) {
    params.push(priority);
    conditions.push(`t.priority = $${params.length}`);
  }
  if (assignedTo) {
    params.push(assignedTo);
    conditions.push(`t.assigned_to = $${params.length}`);
  }

  const sortMap = {
    due_date: 't.due_date ASC NULLS LAST',
    priority: `array_position(ARRAY['critical','high','medium','low'], t.priority)`,
    newest: 't.created_at DESC',
    oldest: 't.created_at ASC',
    title: 't.title ASC',
  };
  const orderBy = sortMap[sort] || 't.position ASC, t.created_at DESC';

  const { rows } = await db.query(
    `SELECT ${TASK_SELECT} FROM tasks t
     LEFT JOIN users au ON au.id = t.assigned_to
     LEFT JOIN users cu ON cu.id = t.created_by
     LEFT JOIN projects p ON p.id = t.project_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY ${orderBy}`,
    params
  );
  return rows;
}

async function update(id, fields) {
  const { title, description, status, priority, assignedTo, dueDate, position } = fields;
  const { rows } = await db.query(
    `UPDATE tasks SET
       title = COALESCE($2, title),
       description = COALESCE($3, description),
       status = COALESCE($4, status),
       priority = COALESCE($5, priority),
       assigned_to = COALESCE($6, assigned_to),
       due_date = COALESCE($7, due_date),
       position = COALESCE($8, position),
       updated_at = now()
     WHERE id = $1 RETURNING *`,
    [id, title, description, status, priority, assignedTo, dueDate, position]
  );
  return rows[0];
}

async function remove(id) {
  await db.query('DELETE FROM tasks WHERE id = $1', [id]);
}

async function countForUserInWorkspace(workspaceId, userId) {
  const { rows } = await db.query(
    `SELECT COUNT(*) FROM tasks WHERE workspace_id = $1 AND assigned_to = $2 AND status != 'completed'`,
    [workspaceId, userId]
  );
  return Number(rows[0].count);
}

async function listAssignedToUser(userId, { dueSoonDays } = {}) {
  const params = [userId];
  let dueClause = '';
  if (dueSoonDays) {
    params.push(dueSoonDays);
    dueClause = `AND t.due_date IS NOT NULL AND t.due_date <= (CURRENT_DATE + $2::int)`;
  }
  const { rows } = await db.query(
    `SELECT ${TASK_SELECT}, w.name AS workspace_name FROM tasks t
     LEFT JOIN users au ON au.id = t.assigned_to
     LEFT JOIN users cu ON cu.id = t.created_by
     LEFT JOIN projects p ON p.id = t.project_id
     LEFT JOIN workspaces w ON w.id = t.workspace_id
     WHERE t.assigned_to = $1 AND t.status != 'completed' ${dueClause}
     ORDER BY t.due_date ASC NULLS LAST
     LIMIT 20`,
    params
  );
  return rows;
}

module.exports = {
  create,
  findById,
  listForWorkspace,
  update,
  remove,
  countForUserInWorkspace,
  listAssignedToUser,
};
