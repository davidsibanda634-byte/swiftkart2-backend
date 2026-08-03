import User from "../models/User.js"
import Listing from "../models/Listing.js"
import Service from "../models/Service.js"
import Job from "../models/Job.js"
import Event from "../models/Event.js"
import Accommodation from "../models/Accommodation.js"
import Report from "../models/Report.js"
import Category from "../models/Category.js"
import Advertisement from "../models/Advertisement.js"
import asyncHandler from "../middleware/asyncHandler.js"

// Dashboard stats
export const getStats = asyncHandler(async (req, res) => {
  const userCount = await User.countDocuments()
  const listingCount = await Listing.countDocuments()
  const serviceCount = await Service.countDocuments()
  const jobCount = await Job.countDocuments()
  const eventCount = await Event.countDocuments()
  const accommodationCount = await Accommodation.countDocuments()
  const reportCount = await Report.countDocuments()
  const bannedCount = await User.countDocuments({ isBanned: true })

  res.json({
    userCount,
    listingCount,
    serviceCount,
    jobCount,
    eventCount,
    accommodationCount,
    reportCount,
    bannedCount,
  })
})

// Get all users
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 })
  res.json(users)
})

// Ban / Unban user
export const toggleBanUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    res.status(404)
    throw new Error("User not found")
  }
  user.isBanned = !user.isBanned
  await user.save()
  res.json({ message: user.isBanned ? "User banned" : "User unbanned", user })
})

// Make / Remove admin
export const toggleAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    res.status(404)
    throw new Error("User not found")
  }
  user.isAdmin = !user.isAdmin
  await user.save()
  res.json({ message: user.isAdmin ? "User made admin" : "Admin removed", user })
})

// Verify / Unverify user
export const toggleVerifyUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    res.status(404)
    throw new Error("User not found")
  }
  user.isVerified = !user.isVerified
  await user.save()
  res.json({ message: user.isVerified ? "User verified" : "Verification removed", user })
})

// Delete user
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    res.status(404)
    throw new Error("User not found")
  }
  await user.deleteOne()
  res.json({ message: "User deleted" })
})

// Get all reports
export const getAllReports = asyncHandler(async (req, res) => {
  const reports = await Report.find()
    .populate("listing")
    .populate("reportedBy", "name email")
    .sort({ createdAt: -1 })
  res.json(reports)
})

// Delete report
export const deleteReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id)
  if (!report) {
    res.status(404)
    throw new Error("Report not found")
  }
  await report.deleteOne()
  res.json({ message: "Report dismissed" })
})

// Get all listings (admin view)
export const getAllListingsAdmin = asyncHandler(async (req, res) => {
  const listings = await Listing.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
  res.json(listings)
})

// Delete any listing (admin)
export const deleteListingAdmin = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id)
  if (!listing) {
    res.status(404)
    throw new Error("Listing not found")
  }
  await listing.deleteOne()
  res.json({ message: "Listing deleted by admin" })
})

// ── Jobs (admin) ──
export const getAllJobsAdmin = asyncHandler(async (req, res) => {
  const jobs = await Job.find().populate("user", "name email").sort({ createdAt: -1 })
  res.json(jobs)
})

export const deleteJobAdmin = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)
  if (!job) {
    res.status(404)
    throw new Error("Job not found")
  }
  await job.deleteOne()
  res.json({ message: "Job deleted by admin" })
})

// ── Services (admin) ──
export const getAllServicesAdmin = asyncHandler(async (req, res) => {
  const services = await Service.find().populate("user", "name email").sort({ createdAt: -1 })
  res.json(services)
})

export const deleteServiceAdmin = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id)
  if (!service) {
    res.status(404)
    throw new Error("Service not found")
  }
  await service.deleteOne()
  res.json({ message: "Service deleted by admin" })
})

// ── Events (admin) ──
export const getAllEventsAdmin = asyncHandler(async (req, res) => {
  const events = await Event.find().populate("user", "name email").sort({ createdAt: -1 })
  res.json(events)
})

export const deleteEventAdmin = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
  if (!event) {
    res.status(404)
    throw new Error("Event not found")
  }
  await event.deleteOne()
  res.json({ message: "Event deleted by admin" })
})

// ── Accommodations (admin) ──
export const getAllAccommodationsAdmin = asyncHandler(async (req, res) => {
  const accommodations = await Accommodation.find().populate("user", "name email").sort({ createdAt: -1 })
  res.json(accommodations)
})

export const deleteAccommodationAdmin = asyncHandler(async (req, res) => {
  const accommodation = await Accommodation.findById(req.params.id)
  if (!accommodation) {
    res.status(404)
    throw new Error("Accommodation not found")
  }
  await accommodation.deleteOne()
  res.json({ message: "Accommodation deleted by admin" })
})

// ── Categories (admin) — sees inactive ones too, unlike the public route ──
export const getAllCategoriesAdmin = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ order: 1, name: 1 })
  res.json(categories)
})

export const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body
  if (!name) {
    res.status(400)
    throw new Error("Name is required")
  }
  const category = await Category.create(req.body)
  res.status(201).json(category)
})

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (!category) {
    res.status(404)
    throw new Error("Category not found")
  }
  const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true })
  res.json(updated)
})

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (!category) {
    res.status(404)
    throw new Error("Category not found")
  }
  await category.deleteOne()
  res.json({ message: "Category deleted" })
})

// ── Advertisements (admin) — sees inactive/expired ones too ──
export const getAllAdvertisementsAdmin = asyncHandler(async (req, res) => {
  const ads = await Advertisement.find().sort({ order: 1, createdAt: -1 })
  res.json(ads)
})

export const createAdvertisement = asyncHandler(async (req, res) => {
  const { title, image } = req.body
  if (!title || !image) {
    res.status(400)
    throw new Error("Title and image are required")
  }
  const ad = await Advertisement.create(req.body)
  res.status(201).json(ad)
})

export const updateAdvertisement = asyncHandler(async (req, res) => {
  const ad = await Advertisement.findById(req.params.id)
  if (!ad) {
    res.status(404)
    throw new Error("Advertisement not found")
  }
  const updated = await Advertisement.findByIdAndUpdate(req.params.id, req.body, { new: true })
  res.json(updated)
})

export const deleteAdvertisement = asyncHandler(async (req, res) => {
  const ad = await Advertisement.findById(req.params.id)
  if (!ad) {
    res.status(404)
    throw new Error("Advertisement not found")
  }
  await ad.deleteOne()
  res.json({ message: "Advertisement deleted" })
})