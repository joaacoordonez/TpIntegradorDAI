import { getPaginatedEvents } from "../repositories/event-repository.js";

export const listEvents = async (page = 1, size = 10) => {
  const limit = size;
  const offset = (page - 1) * size;

  const rows = await getPaginatedEvents(limit, offset);

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    start_date: row.start_date,
    duration_in_minutes: row.duration_in_minutes,
    price: row.price,
    enabled_for_enrollment: row.enabled_for_enrollment,
    max_assistance: row.max_assistance,
    creator_user: {
      id: row.user_id,
      first_name: row.first_name,
      last_name: row.last_name,
      username: row.username
    },
    location: {
      id: row.location_id,
      name: row.location_name,
      full_address: row.full_address,
      max_capacity: row.max_capacity
    }
  }));
};
