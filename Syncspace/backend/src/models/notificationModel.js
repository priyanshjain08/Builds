const db = require('../config/db');

async function create({ userId, type, content, metadata = {} }) {
  const { rows } = await db.query(
    `INSERT INTO notifications (user_id, type, content, metadata)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [userId, type, content, metadata]
  );
  return rows[0];
}

async function listForUser(userId, limit = 40) {
  const { rows } = await db.query(
    `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
    [userId, limit]
  );
  return rows;
}

async function countUnread(userId) {
  const { rows } = await db.query(
    `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false`,
    [userId]
  );
  return Number(rows[0].count);
}

async function markRead(id, userId) {
  const { rows } = await db.query(
    `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, userId]
  );
  return rows[0];
}

async function markAllRead(userId) {
  await db.query(`UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`, [userId]);
}

module.exports = { create, listForUser, countUnread, markRead, markAllRead };
