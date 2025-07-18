import pool from "../../database/db.js";

export const getPaginatedEvents = async (limit, offset, filters = {}) => {
  let baseQuery = `
    SELECT 
      e.id, e.name, e.description, e.start_date, e.duration_in_minutes,
      e.price, e.enabled_for_enrollment, e.max_assistance,
      u.id AS user_id, u.first_name, u.last_name, u.username,
      el.id AS location_id, el.name AS location_name, el.full_address, el.max_capacity
    FROM events e
    LEFT JOIN users u ON u.id = e.id_creator_user
    LEFT JOIN event_locations el ON el.id = e.id_event_location
  `;

  const conditions = [];
  const values = [];
  let index = 1;

  if (filters.name) {
    conditions.push(`e.name ILIKE $${index++}`);
    values.push(`%${filters.name}%`);
  }

  if (filters.startdate) {
    conditions.push(`CAST(e.start_date AS DATE) = $${index++}`);
    values.push(filters.startdate);
  }

  if (filters.tag) {
    conditions.push(`e.tag ILIKE $${index++}`);
    values.push(`%${filters.tag}%`);
  }

  if (conditions.length > 0) {
    baseQuery += ` WHERE ` + conditions.join(" AND ");
  }

  baseQuery += ` ORDER BY e.start_date LIMIT $${index++} OFFSET $${index++}`;
  values.push(limit, offset);

  const result = await pool.query(baseQuery, values);
  return result.rows;
};

export const getEventByIdFromDB = async (id) => {
  const query = `
    SELECT
      e.*, 
      u.id AS user_id, u.first_name, u.last_name, u.username, u.password,
      el.id AS event_location_id, el.name AS el_name, el.full_address, el.max_capacity, el.latitude AS el_lat, el.longitude AS el_long,
      l.id AS location_id, l.name AS location_name, l.id_province, l.latitude AS loc_lat, l.longitude AS loc_long,
      p.id AS province_id, p.name AS province_name, p.full_name AS province_full_name, p.latitude AS p_lat, p.longitude AS p_long
    FROM events e
    JOIN users u ON u.id = e.id_creator_user
    JOIN event_locations el ON el.id = e.id_event_location
    JOIN locations l ON l.id = el.id_location
    JOIN provinces p ON p.id = l.id_province
    WHERE e.id = $1
  `;

  const result = await pool.query(query, [id]);
  if (result.rows.length === 0) return null;

  const row = result.rows[0];

  const tags = [];

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    id_event_location: row.id_event_location,
    start_date: row.start_date,
    duration_in_minutes: row.duration_in_minutes,
    price: row.price,
    enabled_for_enrollment: row.enabled_for_enrollment,
    max_assistance: row.max_assistance,
    id_creator_user: row.id_creator_user,
    event_location: {
      id: row.event_location_id,
      name: row.el_name,
      full_address: row.full_address,
      max_capacity: row.max_capacity,
      latitude: row.el_lat,
      longitude: row.el_long,
      id_creator_user: row.id_creator_user,
      location: {
        id: row.location_id,
        name: row.location_name,
        id_province: row.id_province,
        latitude: row.loc_lat,
        longitude: row.loc_long,
        province: {
          id: row.province_id,
          name: row.province_name,
          full_name: row.province_full_name,
          latitude: row.p_lat,
          longitude: row.p_long,
          display_order: null
        }
      },
      creator_user: {
        id: row.user_id,
        first_name: row.first_name,
        last_name: row.last_name,
        username: row.username,
        password: row.password
      }
    },
    tags: tags,
    creator_user: {
      id: row.user_id,
      first_name: row.first_name,
      last_name: row.last_name,
      username: row.username,
      password: row.password
    }
  };
};

export const insertEvent = async ({
  name,
  description,
  id_event_location,
  start_date,
  duration_in_minutes,
  price,
  enabled_for_enrollment,
  max_assistance,
  id_creator_user,
}) => {
  const query = `
    INSERT INTO events (
      name, description, id_event_location, start_date,
      duration_in_minutes, price, enabled_for_enrollment,
      max_assistance, id_creator_user
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id;
  `;
  const values = [
    name, description, id_event_location, start_date,
    duration_in_minutes, price, enabled_for_enrollment,
    max_assistance, id_creator_user
  ];

  const result = await pool.query(query, values);
  return result.rows[0].id;
};

export const updateEventInDB = async (eventData) => {
  const {
    id,
    name,
    description,
    id_event_location,
    start_date,
    duration_in_minutes,
    price,
    enabled_for_enrollment,
    max_assistance,
  } = eventData;

  await pool.query(
    `UPDATE events SET
      name = $1,
      description = $2,
      id_event_location = $3,
      start_date = $4,
      duration_in_minutes = $5,
      price = $6,
      enabled_for_enrollment = $7,
      max_assistance = $8
    WHERE id = $9`,
    [
      name,
      description,
      id_event_location,
      start_date,
      duration_in_minutes,
      price,
      enabled_for_enrollment,
      max_assistance,
      id
    ]
  );
};

export const getRegistrationsCount = async (eventId) => {
  const query = `SELECT COUNT(*) FROM event_enrollments WHERE id_event = $1`; 
  const result = await pool.query(query, [eventId]);
  return parseInt(result.rows[0].count, 10);
};

export const deleteEventFromDB = async (id) => {
  const query = `DELETE FROM events WHERE id = $1`;
  await pool.query(query, [id]);
};

export const getLocationById = async (id) => {
  const query = `SELECT * FROM event_locations WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

export const isUserRegisteredInEvent = async (userId, eventId) => {
  const result = await pool.query(
    "SELECT 1 FROM event_enrollments WHERE id_user = $1 AND id_event = $2",
    [userId, eventId]
  );
  return result.rowCount > 0;
};

export const registerUserInEvent = async (userId, eventId, registrationDateTime) => {
  await pool.query(
    `INSERT INTO event_enrollments (id_user, id_event, registration_date_time)
     VALUES ($1, $2, $3)`,
    [userId, eventId, registrationDateTime]
  );
};

export const unregisterUserFromEvent = async (userId, eventId) => {
  await pool.query(
    `DELETE FROM event_enrollments WHERE id_user = $1 AND id_event = $2`,
    [userId, eventId]
  );
};


