import Event        from "../models/Event.js"
import asyncHandler from "../middleware/asyncHandler.js"
import { v2 as cloudinary } from "cloudinary"

// Strip HTML tags from user input
const sanitize = (str) => {
  if (typeof str !== 'string') return str
  return str.replace(/<[^>]*>/g, '').trim()
}

// Remove images from Cloudinary when an event is deleted
const deleteFromCloudinary = async (images) => {
  if (!images || images.length === 0) return
  for (const imageUrl of images) {
    try {
      if (!imageUrl || !imageUrl.startsWith('http')) continue
      const parts    = imageUrl.split('/')
      const filename = parts[parts.length - 1].split('.')[0]
      const folder   = parts[parts.length - 2]
      const publicId = folder + '/' + filename
      await cloudinary.uploader.destroy(publicId)
    } catch (err) {
      console.error('Cloudinary delete error:', err.message)
    }
  }
}

// ── GET all events ────────────────────────────────────
export const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find()
    .sort({ createdAt: -1 })
    .populate("user", "name phone isVerified")
  res.json(events)
})

// ── GET single event by id ────────────────────────────
export const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate("user", "name phone isVerified")
  if (!event) {
    res.status(404)
    throw new Error("Event not found")
  }
  res.json(event)
})

// ── CREATE event ──────────────────────────────────────
export const createEvent = asyncHandler(async (req, res) => {
  const imagePaths = req.files?.map(file => file.path) || []
  const {
    title, phone, description, date,
    ticketsEnabled, capacity,

    ecocashNumber, ecocashName,
    upiId, upiName, paymentInstructions,
  } = req.body

  if (!title || !phone) {
    res.status(400)
    throw new Error("Title and phone are required")
  }

  const event = await Event.create({
    title:          sanitize(title),
    description:    sanitize(description || ''),
    phone:          sanitize(phone),
    date:           date,
    location: {
      country: sanitize(req.body['location[country]'] || req.body.location?.country || ''),
      city:    sanitize(req.body['location[city]']    || req.body.location?.city    || ''),
      area:    sanitize(req.body['location[area]']    || req.body.location?.area    || ''),
    },
    ticketsEnabled:      ticketsEnabled === 'true' || ticketsEnabled === true,
    capacity:            parseInt(capacity) || 0,
    images:              imagePaths,
    user:                req.user._id,
    ecocashNumber:       sanitize(ecocashNumber       || ''),
    ecocashName:         sanitize(ecocashName         || ''),
    upiId:               sanitize(upiId               || ''),
    upiName:             sanitize(upiName             || ''),
    paymentInstructions: sanitize(paymentInstructions || ''),
  })

  res.status(201).json(event)
})

// ── UPDATE event ──────────────────────────────────────
export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
  if (!event) {
    res.status(404)
    throw new Error("Event not found")
  }
  if (event.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403)
    throw new Error("Not authorized")
  }
  const updates = {
    title:               sanitize(req.body.title       || event.title),
    description:         sanitize(req.body.description  || ''),
    phone:               sanitize(req.body.phone        || event.phone),
    date:                req.body.date      || event.date,
    location:            req.body.location  || event.location,
    ticketsEnabled:      req.body.ticketsEnabled === 'true' || req.body.ticketsEnabled === true,
    capacity:            parseInt(req.body.capacity) || 0,
    ecocashNumber:       sanitize(req.body.ecocashNumber       || ''),
    ecocashName:         sanitize(req.body.ecocashName         || ''),
    upiId:               sanitize(req.body.upiId               || ''),
    upiName:             sanitize(req.body.upiName             || ''),
    paymentInstructions: sanitize(req.body.paymentInstructions || ''),

  }

  const updated = await Event.findByIdAndUpdate(req.params.id, updates, { new: true })
  res.json(updated)
})

// ── DELETE event ──────────────────────────────────────
export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
  if (!event) {
    res.status(404)
    throw new Error("Event not found")
  }
  if (event.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403)
    throw new Error("Not authorized")
  }
  await deleteFromCloudinary(event.images)
  await event.deleteOne()
  res.json({ message: "Event removed" })
})