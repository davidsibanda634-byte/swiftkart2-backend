import express from "express"
import {
  bookTicket,
  getMyTickets,

  findTicketsByPhone,
  getTicketById,
  getEventAttendees,
  confirmTicket,
  cancelTicket,
  scanTicket,
} from "../controllers/ticketController.js"
import { protect } from "../middleware/authMiddleware.js"

const router = express.Router()

// ── ORDER MATTERS — specific routes before param routes ──
// Scan at the door — organizer must be logged in
router.post("/scan",             protect, scanTicket)

// Book a ticket — public, no login required (guest booking)
router.post("/",                 bookTicket)

// My tickets — logged in users only
router.get("/my",               protect, getMyTickets)

// Find tickets by phone — public, for guests who lost their ticket
router.get("/find/:phone",      findTicketsByPhone)

// All attendees for an event — organizer only
router.get("/event/:eventId",   protect, getEventAttendees)

// Single ticket by id — public so guests can view their ticket
router.get("/:id",              getTicketById)

// Confirm — organizer only
router.put("/:id/confirm",     protect, confirmTicket)

// Cancel — mixed auth handled inside controller
router.put("/:id/cancel",      cancelTicket)
export default router