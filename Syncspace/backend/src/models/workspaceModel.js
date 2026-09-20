const db = require('../config/db');

async function create({ name, description, ownerId }) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO workspaces (name, description, owner_id)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, description || null, ownerId]
    );
    const workspace = rows[0];
    await client.query(
      `INSERT INTO workspace_members (workspace_id, user_id, role) VALUES ($1, $2, 'owner')`,
      [workspace.id, ownerId]
    );
    await client.query('COMMIT');
    return workspace;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function findById(id) {
  const { rows } = await db.query('SELECT * FROM workspaces WHERE id = $1', [id]);
  return rows[0] || null;
}

async function listForUser(userId) {
  const { rows } = await db.query(
    `SELECT w.*, wm.role AS my_role,
       (SELECT COUNT(*) FROM workspace_members m WHERE m.workspace_id = w.id) AS member_count,
       (SELECT COUNT(*) FROM projects p WHERE p.workspace_id = w.id) AS project_count
     FROM workspaces w
     JOIN workspace_members wm ON wm.workspace_id = w.id
     WHERE wm.user_id = $1
     ORDER BY w.created_at DESC`,
    [userId]
  );
  return rows;
}

async function update(id, { name, description }) {
  const { rows } = await db.query(
    `UPDATE workspaces SET
       name = COALESCE($2, name),
       description = COALESCE($3, description),
       updated_at = now()
     WHERE id = $1 RETURNING *`,
    [id, name, description]
  );
  return rows[0];
}

async function remove(id) {
  await db.query('DELETE FROM workspaces WHERE id = $1', [id]);
}

async function getMembership(workspaceId, userId) {
  const { rows } = await db.query(
    'SELECT * FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
    [workspaceId, userId]
  );
  return rows[0] || null;
}

async function listMembers(workspaceId) {
  const { rows } = await db.query(
    `SELECT u.id, u.name, u.email, u.avatar_color, u.title, wm.role, wm.joined_at
     FROM workspace_members wm
     JOIN users u ON u.id = wm.user_id
     WHERE wm.workspace_id = $1
     ORDER BY wm.joined_at ASC`,
    [workspaceId]
  );
  return rows;
}

async function addMember(workspaceId, userId, role = 'member') {
  const { rows } = await db.query(
    `INSERT INTO workspace_members (workspace_id, user_id, role)
     VALUES ($1, $2, $3)
     ON CONFLICT (workspace_id, user_id) DO NOTHING
     RETURNING *`,
    [workspaceId, userId, role]
  );
  return rows[0] || null;
}

async function removeMember(workspaceId, userId) {
  await db.query('DELETE FROM workspace_members WHERE workspace_id = $1 AND user_id = $2', [
    workspaceId,
    userId,
  ]);
}

module.exports = {
  create,
  findById,
  listForUser,
  update,
  remove,
  getMembership,
  listMembers,
  addMember,
  removeMember,
};
