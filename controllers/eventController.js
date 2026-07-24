import Event from "../models/Event.js"
import asyncHandler from "../middleware/asyncHandler.js"
import { v2 as cloudinary } from "cloudinary"

const sanitize = (str) => {
  if (typeof str !== 'string') return str
  return str.replace(/<[^>]*>/g, '').trim()
}

const deleteFromCloudinary = async (images) => {
  if (!images || images.length === 0) return
  for (const imageUrl of images) {
    try {
      if (!imageUrl || !imageUrl.startsWith('http')) continue
      const parts = imageUrl.split('/')
      const filename = parts[parts.length - 1].split('.')[0]
      const folder = parts[parts.length - 2]
      const publicId = folder + '/' + filename
      await cloudinary.uploader.destroy(publicId)
    } catch (err) {
      console.error('Cloudinary delete error:', err.message)
    }
  }
}

export const createEvent = asyncHandler(async (req, res) => {
  const imagePaths = req.files?.map(file => file.path) || []
  const { title, phone } = req.body

  if (!title || !phone) {
    res.status(400)
    throw new Error("Title and phone are required")
  }

  const event = await Event.create({
    ...req.body,
    title: sanitize(title),
    description: sanitize(req.body.description || ''),
    phone: sanitize(phone),
    images: imagePaths,
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

// UPDATE
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
  const updated = await Event.findByIdAndUpdate(
    req.params.id, req.body, { new: true }
  )
  res.json(updated)
})

// DELETE — also removes images from Cloudinary
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