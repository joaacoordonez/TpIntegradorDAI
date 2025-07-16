import pool from "../../database/db.js";

export const findUserByUsername = async (username) => {
  const query = "SELECT * FROM users WHERE username = $1";
  const result = await pool.query(query, [username]);
  return result.rows[0];
};

export const createUser = async ({ first_name, last_name, username, password }) => {
  const query = `
    INSERT INTO users (first_name, last_name, username, password)
    VALUES ($1, $2, $3, $4)
  `;
  await pool.query(query, [first_name, last_name, username, password]);
};
