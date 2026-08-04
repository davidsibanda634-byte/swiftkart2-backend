import express from "express"
import {
  bookTicket,
  getMyTickets,
  getTicketById,
  getEventAttendees,
  confirmTicket,
  cancelTicket,
  scanTicket,
} from "../controllers/ticketController.js"
import { protect } from "../middleware/authMiddleware.js"

const router = express.Router()

// ── ORDER MATTERS — specific routes before param routes ──

// Scan at the door
router.post("/scan",           protect, scanTicket)

// Book a ticket
router.post("/",               protect, bookTicket)

// My tickets
router.get("/my",             protect, getMyTickets)

// All attendees for an event
router.get("/event/:eventId", protect, getEventAttendees)

// Single ticket by id
router.get("/:id",            protect, getTicketById)

// Confirm or cancel a ticket
router.put("/:id/confirm",    protect, confirmTicket)
router.put("/:id/cancel",     protect, cancelTicket)

export default router