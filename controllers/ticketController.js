import Ticket               from "../models/Ticket.js"
import TicketType           from "../models/TicketType.js"
import Event                from "../models/Event.js"
import generateTicketNumber from "../utils/generateTicketNumber.js"
import generateQR           from "../utils/generateQR.js"

// POST /api/tickets
// Protected — user must be logged in to book
export const bookTicket = async (req, res) => {
  try {
    const { ticketTypeId, attendeeName, attendeePhone, paymentMethod } = req.body

    // 1. Find the ticket type
    const ticketType = await TicketType.findById(ticketTypeId).populate("event")
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

    // 4. Check capacity — quantity 0 means unlimited
    if (ticketType.quantity > 0 && ticketType.sold >= ticketType.quantity) {
      return res.status(400).json({ message: "Sorry, this ticket type is sold out" })
    }

    // 5. Generate a unique ticket number
    let ticketNumber
    let isUnique = false
    while (!isUnique) {
      ticketNumber = generateTicketNumber()
      const existing = await Ticket.findOne({ ticketNumber })
      if (!existing) isUnique = true
    }

    // 6. Generate QR code + secure token
    const { qrToken, qrData } = await generateQR(ticketNumber)

    // 7. Free = confirmed instantly, paid = pending until organizer confirms
    const status = ticketType.price === 0 ? "confirmed" : "pending"

    // 8. Create the ticket document
    const ticket = await Ticket.create({
      event:         ticketType.event._id,
      ticketType:    ticketType._id,
      user:          req.user._id,
      attendeeName,
      attendeePhone,
      ticketNumber,
      qrToken,
      qrData,
      status,
      paymentMethod: paymentMethod || (ticketType.price === 0 ? "free" : "whatsapp"),
    })

    // 9. Increment sold counts
    await TicketType.findByIdAndUpdate(ticketType._id,      { $inc: { sold: 1 } })
    await Event.findByIdAndUpdate(ticketType.event._id, { $inc: { ticketsSold: 1 } })

    res.status(201).json(ticket)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/tickets/my
// Protected — all tickets for the logged in user
export const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket
      .find({ user: req.user._id })
      .populate("event", "title date location image")
      .populate("ticketType", "name price currency")
      .sort({ createdAt: -1 })
    res.json(tickets)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/tickets/:id
// Protected — only the ticket owner or admin
export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket
      .findById(req.params.id)
      .populate("event", "title date location image phone")
      .populate("ticketType", "name price currency description")

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" })
    }
    if (ticket.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorised" })
    }

    res.json(ticket)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

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
      .populate("user", "name email")
      .sort({ createdAt: -1 })

    res.json(tickets)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/tickets/:id/confirm
// Protected — only the event organizer
export const confirmTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate({ path: "event", select: "user" })
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

// PUT /api/tickets/:id/cancel
// Protected — ticket owner or event organizer
export const cancelTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate({ path: "event", select: "user" })
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" })
    }

    const isOwner     = ticket.user.toString() === req.user._id.toString()
    const isOrganizer = ticket.event.user.toString() === req.user._id.toString()
    if (!isOwner && !isOrganizer && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorised" })
    }

    ticket.status = "cancelled"
    await ticket.save()

    // Give the spot back
    await TicketType.findByIdAndUpdate(ticket.ticketType,  { $inc: { sold: -1 } })
    await Event.findByIdAndUpdate(ticket.event._id, { $inc: { ticketsSold: -1 } })

    res.json({ message: "Ticket cancelled", ticket })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/tickets/scan
// Protected — organizer scans QR at the door
export const scanTicket = async (req, res) => {
  try {
    const { qrToken } = req.body
    if (!qrToken) {
      return res.status(400).json({ message: "No QR token provided" })
    }

    // QR payload format is "SN:{ticketNumber}:{qrToken}"
    const parts    = qrToken.split(":")
    const rawToken = parts.length === 3 ? parts[2] : qrToken

    const ticket = await Ticket
      .findOne({ qrToken: rawToken })
      .populate("event", "title date user")
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

    ticket.status    = "used"
    ticket.scannedAt = new Date()
    ticket.scannedBy = req.user._id
    await ticket.save()

    res.json({ valid: true, message: "✅ Valid ticket — entry granted", ticket })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}