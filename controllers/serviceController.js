import Service from "../models/Service.js"
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
    .populate("user", "name phone isVerified")
  res.json(services)
})

// UPDATE
export const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id)
  if (!service) {
    res.status(404)
    throw new Error("Service not found")
  }
  if (service.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403)
    throw new Error("Not authorized")
  }
  const updated = await Service.findByIdAndUpdate(
    req.params.id, req.body, { new: true }
  )
  res.json(updated)
})

// DELETE — also removes images from Cloudinary
export const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id)
  if (!service) {
    res.status(404)
    throw new Error("Service not found")
  }
  if (service.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403)
    throw new Error("Not authorized")
  }
  await deleteFromCloudinary(service.images)
  await service.deleteOne()
  res.json({ message: "Service removed" })
})