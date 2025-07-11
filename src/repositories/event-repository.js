import pool from "../../database/db.js";

export const getPaginatedEvents = async (limit, offset) => {
  const query = `
    SELECT 
      e.id, e.name, e.description, e.start_date, e.duration_in_minutes,
      e.price, e.enabled_for_enrollment, e.max_assistance,
      u.id AS user_id, u.first_name, u.last_name, u.username,
      el.id AS location_id, el.name AS location_name, el.full_address, el.max_capacity
    FROM events e
    JOIN users u ON u.id = e.id_creator_user
    JOIN event_locations el ON el.id = e.id_event_location
    ORDER BY e.start_date
    LIMIT $1 OFFSET $2;
  `;
  const result = await pool.query(query, [limit, offset]);
  return result.rows;
};
