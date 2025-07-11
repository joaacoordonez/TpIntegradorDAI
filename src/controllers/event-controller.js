import { listEvents } from "../services/event-service.js";

export const getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;

    const events = await listEvents(page, size);
    res.json(events);
  } catch (err) {
    console.error("Error al obtener eventos:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
