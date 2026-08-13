import Ticket               from "../models/Ticket.js"
import TicketType           from "../models/TicketType.js"
import Event                from "../models/Event.js"
import generateTicketNumber from "../utils/generateTicketNumber.js"
import generateQR           from "../utils/generateQR.js"

// ── BOOK a ticket ─────────────────────────────────────
// POST /api/tickets
// Public — no login required (guest booking supported)
export const bookTicket = async (req, res) => {
  try {
    const {
      ticketTypeId,
      attendeeName,
      attendeePhone,
      paymentMethod,
      paymentReference,
      paymentProofNote,

    } = req.body

    // 1. Find ticket type
    const ticketType = await TicketType
      .findById(ticketTypeId)
      .populate("event")
    if (!ticketType) {
      return res.status(404).json({ message: "Ticket type not found" })
    }

    // 2. Check ticket sales are active
    if (!ticketType.isActive) {
      return res.status(400).json({ message: "Ticket sales are closed for this type" })
    }

    // 3. Check sales window
    const now = new Date()
    if (ticketType.salesStart && now < ticketType.salesStart) {
      return res.status(400).json({ message: "Ticket sales have not started yet" })
    }
    if (ticketType.salesEnd && now > ticketType.salesEnd) {
      return res.status(400).json({ message: "Ticket sales have ended" })
    }

    // 4. Check capacity
    if (ticketType.quantity > 0 && ticketType.sold >= ticketType.quantity) {
      return res.status(400).json({ message: "Sorry, this ticket type is sold out" })
    }

    // 5. For paid tickets — require payment reference
    if (ticketType.price > 0 && !paymentReference) {

      return res.status(400).json({ message: "Payment reference is required for paid tickets" })
    }

    // 6. Generate unique ticket number
    let ticketNumber
    let isUnique = false
    while (!isUnique) {
      ticketNumber = generateTicketNumber()
      const existing = await Ticket.findOne({ ticketNumber })
      if (!existing) isUnique = true
    }

    // 7. Generate QR code + token
    const { qrToken, qrData } = await generateQR(ticketNumber)

    // 8. Determine status
    // Free = confirmed instantly, paid = pending until organizer confirms
    const status = ticketType.price === 0 ? "confirmed" : "pending"

    // 9. Determine payment method
    let method = "free"

    if (ticketType.price > 0) {

      method = paymentMethod || "ecocash"
    }

    // 10. Create the ticket
    const ticket = await Ticket.create({
      event:            ticketType.event._id,
      ticketType:       ticketType._id,

      user:             req.user?._id || null, // null for guests

      attendeeName,
      attendeePhone,
      ticketNumber,
      qrToken,
      qrData,
      status,
      paymentMethod:    method,

      paymentReference: paymentReference || null,


      paymentProofNote: paymentProofNote || null,

    })

    // 11. Increment sold counts
    await TicketType.findByIdAndUpdate(ticketType._id,      { $inc: { sold: 1 } })
    await Event.findByIdAndUpdate(ticketType.event._id, { $inc: { ticketsSold: 1 } })

    // 12. Build WhatsApp notification link for organizer (paid tickets only)
    let organizerWhatsApp = null

    if (ticketType.price > 0) {

      const eventDoc = await Event.findById(ticketType.event._id).populate("user", "name")

      const orgPhone  = eventDoc?.phone?.replace(/\D/g, "")

      const waMsg = [

        `Hi, I have paid $${ticketType.price} for *${eventDoc?.title}*`,

        `Ticket: *${ticketNumber}*`,

        `Reference: *${paymentReference}*`,

        `Name: ${attendeeName}`,

        `Phone: ${attendeePhone}`,

        `Please confirm my ticket.`,

      ].join("\n")

      organizerWhatsApp = `https://wa.me/${orgPhone}?text=` + encodeURIComponent(waMsg)

    }

    res.status(201).json({ ...ticket.toObject(), organizerWhatsApp })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── GET my tickets ────────────────────────────────────
// GET /api/tickets/my
// Protected — logged in users only
export const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket
      .find({ user: req.user._id })
      .populate("event",      "title date location image")
      .populate("ticketType", "name price currency")
      .sort({ createdAt: -1 })
    res.json(tickets)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── FIND tickets by phone (for guests) ────────────────
// GET /api/tickets/find/:phone
// Public — guest uses their phone number to find their tickets

export const findTicketsByPhone = async (req, res) => {

  try {

    const phone = decodeURIComponent(req.params.phone).replace(/\s/g, "+")

    const tickets = await Ticket

      .find({ attendeePhone: { $regex: phone, $options: "i" } })

      .populate("event",      "title date location image")
      .populate("ticketType", "name price currency")

      .sort({ createdAt: -1 })
    res.json(tickets)

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── GET single ticket ─────────────────────────────────
// GET /api/tickets/:id
// Public — anyone with the ticket ID can view it
export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket
      .findById(req.params.id)
      .populate("event",      "title date location image phone ecocashNumber ecocashName upiId upiName")
      .populate("ticketType", "name price currency description")
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" })
    }
    res.json(ticket)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── GET all attendees for an event ────────────────────
// GET /api/tickets/event/:eventId
// Protected — only the event organizer or admin
export const getEventAttendees = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId)
    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }
    if (event.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorised" })
    }
    const tickets = await Ticket
      .find({ event: req.params.eventId })
      .populate("ticketType", "name price currency")
      .populate("user",       "name email")
      .sort({ createdAt: -1 })
    res.json(tickets)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── CONFIRM a ticket ──────────────────────────────────
// PUT /api/tickets/:id/confirm
// Protected — only the event organizer or admin
export const confirmTicket = async (req, res) => {
  try {
    const ticket = await Ticket
      .findById(req.params.id)
      .populate({ path: "event", select: "user" })
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" })
    }
    if (ticket.event.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorised" })
    }
    ticket.status = "confirmed"
    await ticket.save()
    res.json(ticket)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── CANCEL a ticket ───────────────────────────────────
// PUT /api/tickets/:id/cancel
// Protected — ticket owner, organizer, or admin
// Guest cancel — allowed if attendeePhone matches query param
export const cancelTicket = async (req, res) => {
  try {
    const ticket = await Ticket
      .findById(req.params.id)
      .populate({ path: "event", select: "user" })
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" })
    }


    // Allow cancel if: logged-in owner, organizer, admin, or guest with matching phone


    const guestPhone   = req.body.attendeePhone


    const isGuestOwner = guestPhone && ticket.attendeePhone === guestPhone

    const isOwner      = req.user && ticket.user && ticket.user.toString() === req.user._id.toString()
    const isOrganizer  = req.user && ticket.event.user.toString() === req.user._id.toString()
    const isAdmin      = req.user?.isAdmin


    if (!isOwner && !isOrganizer && !isAdmin && !isGuestOwner) {

      return res.status(403).json({ message: "Not authorised" })
    }

    ticket.status = "cancelled"
    await ticket.save()
    await TicketType.findByIdAndUpdate(ticket.ticketType, { $inc: { sold: -1 } })
    await Event.findByIdAndUpdate(ticket.event._id,      { $inc: { ticketsSold: -1 } })
    res.json({ message: "Ticket cancelled", ticket })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── SCAN a ticket at the door ─────────────────────────
// POST /api/tickets/scan
// Protected — organizer scans QR, sends qrToken
export const scanTicket = async (req, res) => {
  try {
    const { qrToken } = req.body
    if (!qrToken) {
      return res.status(400).json({ message: "No QR token provided" })
    }
    const parts    = qrToken.split(":")
    const rawToken = parts.length === 3 ? parts[2] : qrToken
    const ticket = await Ticket
      .findOne({ qrToken: rawToken })
      .populate("event",      "title date user")
      .populate("ticketType", "name")
    if (!ticket) {
      return res.status(404).json({ valid: false, message: "Invalid ticket — not found" })
    }
    if (ticket.status === "used") {
      return res.json({ valid: false, message: "Ticket already used", scannedAt: ticket.scannedAt, ticket })
    }
    if (ticket.status === "cancelled") {
      return res.json({ valid: false, message: "Ticket has been cancelled", ticket })
    }
    if (ticket.status === "pending") {
      return res.json({ valid: false, message: "Ticket not yet confirmed by organizer", ticket })
    }
    ticket.status    = "used"
    ticket.scannedAt = new Date()
    ticket.scannedBy = req.user._id
    await ticket.save()
    res.json({ valid: true, message: "✅ Valid ticket — entry granted", ticket })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}