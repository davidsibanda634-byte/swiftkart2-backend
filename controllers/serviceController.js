import Service from "../models/Service.js"
import asyncHandler from "../middleware/asyncHandler.js"

const sanitize = (str) => {
  if (typeof str !== 'string') return str
  return str.replace(/<[^>]*>/g, '').trim()
}

export const createService = asyncHandler(async (req, res) => {
  const imagePaths = req.files?.map(file => file.path) || []

  const { title, phone } = req.body

  if (!title || !phone) {
    res.status(400)
    throw new Error("Title and phone are required")
  }

  const service = await Service.create({
    ...req.body,
    title: sanitize(title),
    description: sanitize(req.body.description || ''),
    phone: sanitize(phone),
    images: imagePaths,
    user: req.user._id,
  })
  res.status(201).json(service)
})

export const getServices = asyncHandler(async (req, res) => {
  const services = await Service.find()
    .sort({ createdAt: -1 })
    .populate("user", "name phone")
  res.json(services)
})

export const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id)
  if (!service) {
    res.status(404)
    throw new Error("Service not found")
  }
  // Allow owner OR admin
  if (service.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403)
    throw new Error("Not authorized")
  }
  await service.deleteOne()
  res.json({ message: "Service removed" })
})