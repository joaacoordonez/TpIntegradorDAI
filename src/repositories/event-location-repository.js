import pool from "../../database/db.js";

export const getEventLocationsFromDB = async (userId, limit, offset) => {
  const query = `
    SELECT * FROM event_locations
    WHERE id_creator_user = $1
    ORDER BY id
    LIMIT $2 OFFSET $3
  `;
  const result = await pool.query(query, [userId, limit, offset]);
  return result.rows;
};

export const getEventLocationByIdFromDB = async (id) => {
  const query = `SELECT * FROM event_locations WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

export const insertEventLocation = async ({
  name,
  full_address,
  max_capacity,
  latitude,
  longitude,
  id_creator_user,
}) => {
  const query = `
    INSERT INTO event_locations
    (name, full_address, max_capacity, latitude, longitude, id_creator_user)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
  `;
  const values = [name, full_address, max_capacity, latitude, longitude, id_creator_user];
  const result = await pool.query(query, values);
  return result.rows[0].id;
};

export const updateEventLocationInDB = async ({
  id,
  name,
  full_address,
  max_capacity,
  latitude,
  longitude,
}) => {
  const query = `
    UPDATE event_locations SET
      name = $1,
      full_address = $2,
      max_capacity = $3,
      latitude = $4,
      longitude = $5
    WHERE id = $6
  `;
  const values = [name, full_address, max_capacity, latitude, longitude, id];
  await pool.query(query, values);
};

export const deleteEventLocationFromDB = async (id) => {
  const query = `DELETE FROM event_locations WHERE id = $1`;
  await pool.query(query, [id]);
};
