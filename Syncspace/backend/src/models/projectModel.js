const db = require('../config/db');

async function create({ workspaceId, name, description, status, createdBy }) {
  const { rows } = await db.query(
    `INSERT INTO projects (workspace_id, name, description, status, created_by)
     VALUES ($1, $2, $3, COALESCE($4, 'planning'), $5)
     RETURNING *`,
    [workspaceId, name, description || null, status, createdBy]
  );
  return rows[0];
}

async function findById(id) {
  const { rows } = await db.query('SELECT * FROM projects WHERE id = $1', [id]);
  return rows[0] || null;
}

async function listForWorkspace(workspaceId, { search, status } = {}) {
  const conditions = ['p.workspace_id = $1'];
  const params = [workspaceId];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`p.name ILIKE $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`p.status = $${params.length}`);
  }

  const { rows } = await db.query(
    `SELECT p.*,
       (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) AS total_tasks,
       (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'completed') AS completed_tasks
     FROM projects p
     WHERE ${conditions.join(' AND ')}
     ORDER BY p.created_at DESC`,
    params
  );
  return rows;
}

async function update(id, { name, description, status }) {
  const { rows } = await db.query(
    `UPDATE projects SET
       name = COALESCE($2, name),
       description = COALESCE($3, description),
       status = COALESCE($4, status),
       updated_at = now()
     WHERE id = $1 RETURNING *`,
    [id, name, description, status]
  );
  return rows[0];
}

async function remove(id) {
  await db.query('DELETE FROM projects WHERE id = $1', [id]);
}

async function countActiveForWorkspace(workspaceId) {
  const { rows } = await db.query(
    `SELECT COUNT(*) FROM projects WHERE workspace_id = $1 AND status = 'active'`,
    [workspaceId]
  );
  return Number(rows[0].count);
}

module.exports = { create, findById, listForWorkspace, update, remove, countActiveForWorkspace };
