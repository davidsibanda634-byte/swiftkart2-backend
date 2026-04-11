import Event from "../models/Event.js"
import asyncHandler from "../middleware/asyncHandler.js"

export const createEvent = asyncHandler(async (req, res) => {
  const event = await Event.create({
    ...req.body,
    user: req.user._id,
  })
  res.status(201).json(event)
})

export const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find()
    .sort({ createdAt: -1 })
    .populate("user", "name phone")
  res.json(events)
})

export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)

  if (!event) {
    res.status(404)
    throw new Error("Event not found")
  }

  if (event.user.toString() !== req.user._id.toString()) {
    res.status(401)
    throw new Error("Not authorized")
  }

  await event.deleteOne()
  res.json({ message: "Event removed" })
})