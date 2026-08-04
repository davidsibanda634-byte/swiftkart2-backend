import express from "express"
import {
  getTicketTypesByEvent,
  createTicketType,
  updateTicketType,
  deleteTicketType,
} from "../controllers/ticketTypeController.js"
import { protect } from "../middleware/authMiddleware.js"

const router = express.Router()

// Public — get all ticket types for an event
router.get("/event/:eventId", getTicketTypesByEvent)

// Protected — organizer only
router.post("/",        protect, createTicketType)
router.put("/:id",    protect, updateTicketType)
router.delete("/:id", protect, deleteTicketType)

export default router