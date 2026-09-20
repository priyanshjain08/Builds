const db = require('../config/db');

async function create({ workspaceId, userId, type, description, metadata = {} }) {
  const { rows } = await db.query(
    `INSERT INTO activities (workspace_id, user_id, type, description, metadata)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [workspaceId, userId || null, type, description, metadata]
  );
  return rows[0];
}

async function listForWorkspace(workspaceId, limit = 30) {
  const { rows } = await db.query(
    `SELECT a.*, u.name AS actor_name, u.avatar_color AS actor_color
     FROM activities a
     LEFT JOIN users u ON u.id = a.user_id
     WHERE a.workspace_id = $1
     ORDER BY a.created_at DESC
     LIMIT $2`,
    [workspaceId, limit]
  );
  return rows;
}

async function listForUserWorkspaces(userId, limit = 15) {
  const { rows } = await db.query(
    `SELECT a.*, u.name AS actor_name, u.avatar_color AS actor_color, w.name AS workspace_name
     FROM activities a
     LEFT JOIN users u ON u.id = a.user_id
     JOIN workspace_members wm ON wm.workspace_id = a.workspace_id AND wm.user_id = $1
     JOIN workspaces w ON w.id = a.workspace_id
     ORDER BY a.created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return rows;
}

module.exports = { create, listForWorkspace, listForUserWorkspaces };
