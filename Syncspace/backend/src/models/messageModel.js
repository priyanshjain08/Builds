const db = require('../config/db');

async function create({ workspaceId, userId, content }) {
  const { rows } = await db.query(
    `INSERT INTO messages (workspace_id, user_id, content) VALUES ($1, $2, $3) RETURNING *`,
    [workspaceId, userId, content]
  );
  return rows[0];
}

async function listForWorkspace(workspaceId, { before, limit = 50 } = {}) {
  const params = [workspaceId];
  let beforeClause = '';
  if (before) {
    params.push(before);
    beforeClause = `AND m.created_at < $${params.length}`;
  }
  params.push(limit);

  const { rows } = await db.query(
    `SELECT m.*, u.name AS sender_name, u.avatar_color AS sender_color
     FROM messages m
     JOIN users u ON u.id = m.user_id
     WHERE m.workspace_id = $1 ${beforeClause}
     ORDER BY m.created_at DESC
     LIMIT $${params.length}`,
    params
  );
  return rows.reverse();
}

module.exports = { create, listForWorkspace };
