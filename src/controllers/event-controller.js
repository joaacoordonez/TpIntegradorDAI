import { listEvents, getEventDetail  } from "../services/event-service.js";

export const getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;

    const filters = {
      name: req.query.name || null,
      startdate: req.query.startdate || null,
    };

    const events = await listEvents(page, size, filters);
    res.json(events);
  } catch (err) {
    console.error("Error al obtener eventos:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const getEventById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

    const event = await getEventDetail(id);

    if (!event) return res.status(404).json({ error: "Evento no encontrado" });

    res.status(200).json(event);
  } catch (err) {
    console.error("Error al obtener detalle de evento:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

import {
  insertEvent,
  getEventByIdFromDB,
  updateEventInDB,
  deleteEventFromDB,
  getRegistrationsCount,
  getLocationById,
} from "../repositories/event-repository.js";

export const createEvent = async (req, res) => {
  try {
    const {
      name,
      description,
      id_event_location,
      start_date,
      duration_in_minutes,
      price,
      enabled_for_enrollment,
      max_assistance,
    } = req.body;

    // Validaciones:
    if (!name || name.length < 3)
      return res.status(400).json({ message: "El nombre debe tener al menos 3 caracteres." });
    if (!description || description.length < 3)
      return res.status(400).json({ message: "La descripción debe tener al menos 3 caracteres." });
    if (price < 0)
      return res.status(400).json({ message: "El precio no puede ser negativo." });
    if (duration_in_minutes < 0)
      return res.status(400).json({ message: "La duración no puede ser negativa." });

    // Validar max_assistance con capacidad del lugar
    const location = await getLocationById(id_event_location);
    if (!location)
      return res.status(400).json({ message: "La ubicación del evento no existe." });

    if (max_assistance > location.max_capacity)
      return res.status(400).json({ message: "La asistencia máxima no puede superar la capacidad del lugar." });

    // Insertar evento
    const eventId = await insertEvent({
      name,
      description,
      id_event_location,
      start_date,
      duration_in_minutes,
      price,
      enabled_for_enrollment,
      max_assistance,
      id_creator_user: req.user.id,
    });

    return res.status(201).json({ message: "Evento creado", eventId });
  } catch (error) {
    console.error("Error en createEvent:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const updateEvent = async (req, res) => {
  try {
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
    } = req.body;

    if (!id)
      return res.status(400).json({ message: "El id del evento es requerido." });

    // Validaciones similares a createEvent:
    if (!name || name.length < 3)
      return res.status(400).json({ message: "El nombre debe tener al menos 3 caracteres." });
    if (!description || description.length < 3)
      return res.status(400).json({ message: "La descripción debe tener al menos 3 caracteres." });
    if (price < 0)
      return res.status(400).json({ message: "El precio no puede ser negativo." });
    if (duration_in_minutes < 0)
      return res.status(400).json({ message: "La duración no puede ser negativa." });

    const location = await getLocationById(id_event_location);
    if (!location)
      return res.status(400).json({ message: "La ubicación del evento no existe." });

    if (max_assistance > location.max_capacity)
      return res.status(400).json({ message: "La asistencia máxima no puede superar la capacidad del lugar." });

    const event = await getEventByIdFromDB(id);
    if (!event)
      return res.status(404).json({ message: "Evento no encontrado." });

    if (event.id_creator_user !== req.user.id)
      return res.status(404).json({ message: "No podés modificar un evento que no es tuyo." });

    await updateEventInDB({
      id,
      name,
      description,
      id_event_location,
      start_date,
      duration_in_minutes,
      price,
      enabled_for_enrollment,
      max_assistance,
    });

    return res.status(200).json({ message: "Evento actualizado correctamente." });
  } catch (error) {
    console.error("Error en updateEvent:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await getEventByIdFromDB(id);
    if (!event)
      return res.status(404).json({ message: "Evento no encontrado." });

    if (event.id_creator_user !== req.user.id)
      return res.status(404).json({ message: "No podés eliminar un evento que no es tuyo." });

    const registrationsCount = await getRegistrationsCount(id);
    if (registrationsCount > 0)
      return res.status(400).json({ message: "No se puede eliminar un evento con inscripciones." });

    await deleteEventFromDB(id);

    return res.status(200).json({ message: "Evento eliminado correctamente.", event });
  } catch (error) {
    console.error("Error en deleteEvent:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

