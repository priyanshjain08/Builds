const db = require('../config/db');

const PUBLIC_FIELDS = 'id, name, email, avatar_color, title, created_at, updated_at';

async function create({ name, email, passwordHash, avatarColor }) {
  const { rows } = await db.query(
    `INSERT INTO users (name, email, password_hash, avatar_color)
     VALUES ($1, $2, $3, $4)
     RETURNING ${PUBLIC_FIELDS}`,
    [name, email, passwordHash, avatarColor]
  );
  return rows[0];
}

async function findByEmail(email) {
  const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await db.query(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = $1`, [id]);
  return rows[0] || null;
}

async function findManyByIds(ids) {
  if (!ids.length) return [];
  const { rows } = await db.query(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ANY($1::uuid[])`, [ids]);
  return rows;
}

async function updateProfile(id, { name, title, avatarColor }) {
  const { rows } = await db.query(
    `UPDATE users SET
       name = COALESCE($2, name),
       title = COALESCE($3, title),
       avatar_color = COALESCE($4, avatar_color),
       updated_at = now()
     WHERE id = $1
     RETURNING ${PUBLIC_FIELDS}`,
    [id, name, title, avatarColor]
  );
  return rows[0];
}

async function search(query, excludeUserId, limit = 8) {
  const { rows } = await db.query(
    `SELECT ${PUBLIC_FIELDS} FROM users
     WHERE (name ILIKE $1 OR email ILIKE $1) AND id != $2
     ORDER BY name ASC
     LIMIT $3`,
    [`%${query}%`, excludeUserId, limit]
  );
  return rows;
}

module.exports = { create, findByEmail, findById, findManyByIds, updateProfile, search };
