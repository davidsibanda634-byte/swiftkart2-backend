import User          from "../models/User.js"
import Listing       from "../models/Listing.js"
import Service       from "../models/Service.js"
import Job           from "../models/Job.js"
import Event         from "../models/Event.js"
import Accommodation from "../models/Accommodation.js"
import Report        from "../models/Report.js"
import Category      from "../models/Category.js"
import Advertisement from "../models/Advertisement.js"
import AdminLog      from "../models/AdminLog.js"
import asyncHandler  from "../middleware/asyncHandler.js"
import { logAction } from "../utils/logAction.js"

// ── Dashboard stats ──────────────────────────────────────────────────────────
export const getStats = asyncHandler(async (req, res) => {
  const userCount         = await User.countDocuments()
  const listingCount      = await Listing.countDocuments()
  const serviceCount      = await Service.countDocuments()
  const jobCount          = await Job.countDocuments()
  const eventCount        = await Event.countDocuments()
  const accommodationCount= await Accommodation.countDocuments()
  const reportCount       = await Report.countDocuments()
  const bannedCount       = await User.countDocuments({ isBanned: true })

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

// ── Users ────────────────────────────────────────────────────────────────────
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 })
  res.json(users)
})

export const toggleBanUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) { res.status(404); throw new Error("User not found") }

  user.isBanned  = !user.isBanned
  user.banReason = req.body.reason || ""
  user.bannedAt  = user.isBanned ? new Date() : null
  await user.save()

  await logAction(
    req,
    user.isBanned ? "ban_user" : "unban_user",
    "User",
    user._id,
    (user.isBanned ? "Banned " : "Unbanned ") + user.name +
      (req.body.reason ? " — reason: " + req.body.reason : "")
  )

  res.json({ message: user.isBanned ? "User banned" : "User unbanned", user })
})

export const toggleAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) { res.status(404); throw new Error("User not found") }

  user.isAdmin = !user.isAdmin
  await user.save()

  await logAction(
    req,
    user.isAdmin ? "make_admin" : "remove_admin",
    "User",
    user._id,
    (user.isAdmin ? "Granted admin to " : "Removed admin from ") + user.name
  )

  res.json({ message: user.isAdmin ? "User made admin" : "Admin removed", user })
})

export const toggleVerifyUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) { res.status(404); throw new Error("User not found") }

  user.isVerified = !user.isVerified
  user.verifiedAt = user.isVerified ? new Date() : null
  await user.save()

  await logAction(
    req,
    user.isVerified ? "verify_user" : "unverify_user",
    "User",
    user._id,
    (user.isVerified ? "Verified " : "Unverified ") + user.name
  )

  res.json({ message: user.isVerified ? "User verified" : "Verification removed", user })
})

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) { res.status(404); throw new Error("User not found") }

  // Log before delete so we still have the name
  await logAction(
    req,
    "delete_user",
    "User",
    user._id,
    "Deleted user " + user.name + " (" + user.email + ")"
  )

  await user.deleteOne()
  res.json({ message: "User deleted" })
})

// ── Reports ──────────────────────────────────────────────────────────────────
export const getAllReports = asyncHandler(async (req, res) => {
  const reports = await Report.find()
    .populate("listing")
    .populate("reportedBy", "name email")
    .sort({ createdAt: -1 })
  res.json(reports)
})

export const deleteReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id)
  if (!report) { res.status(404); throw new Error("Report not found") }

  await logAction(
    req,
    "dismiss_report",
    "Report",
    report._id,
    "Dismissed report #" + report._id
  )

  await report.deleteOne()
  res.json({ message: "Report dismissed" })
})

// ── Listings ─────────────────────────────────────────────────────────────────
export const getAllListingsAdmin = asyncHandler(async (req, res) => {
  const listings = await Listing.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
  res.json(listings)
})

export const deleteListingAdmin = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id)
  if (!listing) { res.status(404); throw new Error("Listing not found") }

  await logAction(
    req,
    "delete_listing",
    "Listing",
    listing._id,
    "Deleted listing: " + listing.title
  )

  await listing.deleteOne()
  res.json({ message: "Listing deleted by admin" })
})

// ── Jobs ─────────────────────────────────────────────────────────────────────
export const getAllJobsAdmin = asyncHandler(async (req, res) => {
  const jobs = await Job.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
  res.json(jobs)
})

export const deleteJobAdmin = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)
  if (!job) { res.status(404); throw new Error("Job not found") }

  await logAction(
    req,
    "delete_job",
    "Job",
    job._id,
    "Deleted job: " + job.title
  )

  await job.deleteOne()
  res.json({ message: "Job deleted by admin" })
})

// ── Services ─────────────────────────────────────────────────────────────────
export const getAllServicesAdmin = asyncHandler(async (req, res) => {
  const services = await Service.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
  res.json(services)
})

export const deleteServiceAdmin = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id)
  if (!service) { res.status(404); throw new Error("Service not found") }

  await logAction(
    req,
    "delete_service",
    "Service",
    service._id,
    "Deleted service: " + service.title
  )

  await service.deleteOne()
  res.json({ message: "Service deleted by admin" })
})

// ── Events ───────────────────────────────────────────────────────────────────
export const getAllEventsAdmin = asyncHandler(async (req, res) => {
  const events = await Event.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
  res.json(events)
})

export const deleteEventAdmin = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
  if (!event) { res.status(404); throw new Error("Event not found") }

  await logAction(
    req,
    "delete_event",
    "Event",
    event._id,
    "Deleted event: " + event.title
  )

  await event.deleteOne()
  res.json({ message: "Event deleted by admin" })
})

// ── Accommodations ────────────────────────────────────────────────────────────
export const getAllAccommodationsAdmin = asyncHandler(async (req, res) => {
  const accommodations = await Accommodation.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
  res.json(accommodations)
})

export const deleteAccommodationAdmin = asyncHandler(async (req, res) => {
  const accommodation = await Accommodation.findById(req.params.id)
  if (!accommodation) { res.status(404); throw new Error("Accommodation not found") }

  await logAction(
    req,
    "delete_accommodation",
    "Accommodation",
    accommodation._id,
    "Deleted accommodation: " + accommodation.title
  )

  await accommodation.deleteOne()
  res.json({ message: "Accommodation deleted by admin" })
})

// ── Categories ────────────────────────────────────────────────────────────────
export const getAllCategoriesAdmin = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ order: 1, name: 1 })
  res.json(categories)
})

export const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body
  if (!name) { res.status(400); throw new Error("Name is required") }
  const category = await Category.create(req.body)

  await logAction(
    req,
    "delete_listing", // reuse closest action — categories not in enum yet, silent fallback
    "Listing",
    category._id,
    "Created category: " + category.name
  )

  res.status(201).json(category)
})

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (!category) { res.status(404); throw new Error("Category not found") }
  const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true })
  res.json(updated)
})

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (!category) { res.status(404); throw new Error("Category not found") }

  await logAction(
    req,
    "delete_listing",
    "Listing",
    category._id,
    "Deleted category: " + category.name
  )

  await category.deleteOne()
  res.json({ message: "Category deleted" })
})

// ── Advertisements ────────────────────────────────────────────────────────────
export const getAllAdvertisementsAdmin = asyncHandler(async (req, res) => {
  const ads = await Advertisement.find().sort({ order: 1, createdAt: -1 })
  res.json(ads)
})

export const createAdvertisement = asyncHandler(async (req, res) => {
  const { title, image } = req.body
  if (!title || !image) { res.status(400); throw new Error("Title and image are required") }
  const ad = await Advertisement.create(req.body)
  res.status(201).json(ad)
})

export const updateAdvertisement = asyncHandler(async (req, res) => {
  const ad = await Advertisement.findById(req.params.id)
  if (!ad) { res.status(404); throw new Error("Advertisement not found") }
  const updated = await Advertisement.findByIdAndUpdate(req.params.id, req.body, { new: true })
  res.json(updated)
})

export const deleteAdvertisement = asyncHandler(async (req, res) => {
  const ad = await Advertisement.findById(req.params.id)
  if (!ad) { res.status(404); throw new Error("Advertisement not found") }

  await logAction(
    req,
    "delete_listing",
    "Listing",
    ad._id,
    "Deleted advertisement: " + ad.title
  )

  await ad.deleteOne()
  res.json({ message: "Advertisement deleted" })
})

// ── Audit Logs ────────────────────────────────────────────────────────────────
export const getAllLogsAdmin = asyncHandler(async (req, res) => {
  const logs = await AdminLog.find()
    .sort({ createdAt: -1 })
    .limit(500)
  res.json(logs)
})