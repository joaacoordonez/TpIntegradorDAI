import express from "express";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/event-controller.js";

import {enrollUserInEvent, unregisterUserFromEventController} from "../controllers/event-controller.js"

import { authenticateToken } from "../middlewares/autentication-middleware.js";

const router = express.Router();

router.get("/event", getEvents);
router.get("/event/:id", getEventById);

router.post("/event", authenticateToken, createEvent);
router.put("/event/:id", authenticateToken, updateEvent);
router.delete("/event/:id", authenticateToken, deleteEvent);

router.post("/event/:id/enrollment", authenticateToken, enrollUserInEvent);
router.delete("/event/:id/enrollment", authenticateToken, unregisterUserFromEventController);

export default router;
