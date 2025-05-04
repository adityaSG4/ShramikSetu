const db = require('../config/db');

// This function creates a new user in the database with the provided username, email, password, and role (default user).
exports.createUser = async (username, email, password, role) => {
  const result = await db.query(
    'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
    [username, email, password, role]
  );
  return result.rows[0];
};

// This function retrieves a single user from the database based on the provided ID.
exports.getUserByEmail = async (email) => {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};
