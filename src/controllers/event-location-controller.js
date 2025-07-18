import {
    getEventLocationsFromDB,
    getEventLocationByIdFromDB,
    insertEventLocation,
    updateEventLocationInDB,
    deleteEventLocationFromDB,
  } from "../repositories/event-location-repository.js";
  
  export const getEventLocations = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const size = parseInt(req.query.size) || 10;
  
      // El usuario autenticado: req.user.id
      const userId = req.user.id;
  
      const locations = await getEventLocationsFromDB(userId, size, (page - 1) * size);
      return res.status(200).json(locations);
    } catch (error) {
      console.error("Error en getEventLocations:", error);
      return res.status(500).json({ message: "Error interno del servidor." });
    }
  };
  
  export const getEventLocationById = async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
  
      if (isNaN(id)) return res.status(400).json({ message: "ID inválido." });
  
      const location = await getEventLocationByIdFromDB(id);
  
      if (!location || location.id_creator_user !== userId)
        return res.status(404).json({ message: "Ubicación no encontrada." });
  
      return res.status(200).json(location);
    } catch (error) {
      console.error("Error en getEventLocationById:", error);
      return res.status(500).json({ message: "Error interno del servidor." });
    }
  };
  
  export const createEventLocation = async (req, res) => {
    try {
      const userId = req.user.id;
      const { name, full_address, max_capacity, latitude, longitude } = req.body;
  
      if (!name || name.length < 3)
        return res.status(400).json({ message: "El nombre debe tener al menos 3 caracteres." });
      if (!full_address || full_address.length < 5)
        return res.status(400).json({ message: "La dirección debe tener al menos 5 caracteres." });
      if (!max_capacity || max_capacity <= 0)
        return res.status(400).json({ message: "La capacidad máxima debe ser mayor a 0." });
  
      const newLocationId = await insertEventLocation({
        name,
        full_address,
        max_capacity,
        latitude,
        longitude,
        id_creator_user: userId,
      });
  
      return res.status(201).json({ message: "Ubicación creada.", id: newLocationId });
    } catch (error) {
      console.error("Error en createEventLocation:", error);
      return res.status(500).json({ message: "Error interno del servidor." });
    }
  };
  
  export const updateEventLocation = async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      const { name, full_address, max_capacity, latitude, longitude } = req.body;
  
      if (isNaN(id)) return res.status(400).json({ message: "ID inválido." });
      if (!name || name.length < 3)
        return res.status(400).json({ message: "El nombre debe tener al menos 3 caracteres." });
      if (!full_address || full_address.length < 5)
        return res.status(400).json({ message: "La dirección debe tener al menos 5 caracteres." });
      if (!max_capacity || max_capacity <= 0)
        return res.status(400).json({ message: "La capacidad máxima debe ser mayor a 0." });
  
      const existingLocation = await getEventLocationByIdFromDB(id);
  
      if (!existingLocation || existingLocation.id_creator_user !== userId)
        return res.status(404).json({ message: "Ubicación no encontrada o no autorizada." });
  
      await updateEventLocationInDB({
        id,
        name,
        full_address,
        max_capacity,
        latitude,
        longitude,
      });
  
      return res.status(200).json({ message: "Ubicación actualizada correctamente." });
    } catch (error) {
      console.error("Error en updateEventLocation:", error);
      return res.status(500).json({ message: "Error interno del servidor." });
    }
  };
  
  export const deleteEventLocation = async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
  
      if (isNaN(id)) return res.status(400).json({ message: "ID inválido." });
  
      const existingLocation = await getEventLocationByIdFromDB(id);
  
      if (!existingLocation || existingLocation.id_creator_user !== userId)
        return res.status(404).json({ message: "Ubicación no encontrada o no autorizada." });
  
      // Podrías agregar aquí verificación si la ubicación está en uso por eventos para evitar borrado
  
      await deleteEventLocationFromDB(id);
  
      return res.status(200).json({ message: "Ubicación eliminada correctamente." });
    } catch (error) {
      console.error("Error en deleteEventLocation:", error);
      return res.status(500).json({ message: "Error interno del servidor." });
    }
  };
  