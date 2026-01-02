import pool from "../config/db.js";

export const createClient = async (userId, name, email, address) => {
  const result = await pool.query(
    "INSERT INTO clients (user_id, name, email, address) VALUES ($1, $2, $3, $4) RETURNING *",
    [userId, name, email, address]
  );
  return result.rows[0];
};

export const getClientsByUser = async (userId) => {
  const result = await pool.query("SELECT * FROM clients WHERE user_id = $1", [userId]);
  return result.rows;
};