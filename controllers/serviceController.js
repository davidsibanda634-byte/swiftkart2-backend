import Service from "../models/Service.js"
import asyncHandler from "../middleware/asyncHandler.js"

export const createService = asyncHandler(async (req, res) => {
  const service = await Service.create({
    ...req.body,
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

  if (service.user.toString() !== req.user._id.toString()) {
    res.status(401)
    throw new Error("Not authorized")
  }

  await service.deleteOne()
  res.json({ message: "Service removed" })
})