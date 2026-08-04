import TicketType from "../models/TicketType.js"
import Event      from "../models/Event.js"

// GET /api/ticket-types/event/:eventId
// Public — anyone can see ticket types for an event
export const getTicketTypesByEvent = async (req, res) => {
  try {
    const types = await TicketType
      .find({ event: req.params.eventId })
      .sort({ price: 1 })
    res.json(types)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/ticket-types
// Protected — only the event organizer can create
export const createTicketType = async (req, res) => {
  try {
    const { eventId, name, description, price, currency, quantity, salesStart, salesEnd } = req.body

    const event = await Event.findById(eventId)
    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }
    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorised — you do not own this event" })
    }

    const ticketType = await TicketType.create({
      event:      eventId,
      name,
      description,
      price:      price      || 0,
      currency:   currency   || "USD",
      quantity:   quantity   || 0,
      salesStart: salesStart || null,
      salesEnd:   salesEnd   || null,
    })

    res.status(201).json(ticketType)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/ticket-types/:id
// Protected — only the event organizer
export const updateTicketType = async (req, res) => {
  try {
    const ticketType = await TicketType.findById(req.params.id).populate("event")
    if (!ticketType) {
      return res.status(404).json({ message: "Ticket type not found" })
    }
    if (ticketType.event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorised" })
    }

    const allowed = ["name", "description", "price", "currency", "quantity", "isActive", "salesStart", "salesEnd"]
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) ticketType[field] = req.body[field]
    })

    const updated = await ticketType.save()
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// DELETE /api/ticket-types/:id
// Protected — only the event organizer
export const deleteTicketType = async (req, res) => {
  try {
    const ticketType = await TicketType.findById(req.params.id).populate("event")
    if (!ticketType) {
      return res.status(404).json({ message: "Ticket type not found" })
    }
    if (ticketType.event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorised" })
    }

    await ticketType.deleteOne()
    res.json({ message: "Ticket type deleted" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}