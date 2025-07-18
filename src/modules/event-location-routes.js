import express from "express";
import {
  getEventLocations,
  getEventLocationById,
  createEventLocation,
  updateEventLocation,
  deleteEventLocation,
} from "../controllers/event-location-controller.js";

import { authenticateToken } from "../middlewares/autentication-middleware.js";

const router = express.Router();

router.get("/event-location", authenticateToken, getEventLocations);
router.get("/event-location/:id", authenticateToken, getEventLocationById);
router.post("/event-location", authenticateToken, createEventLocation);
router.put("/event-location/:id", authenticateToken, updateEventLocation);
router.delete("/event-location/:id", authenticateToken, deleteEventLocation);

export default router;
