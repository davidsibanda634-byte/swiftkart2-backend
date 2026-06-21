import User from "../models/User.js"
import Listing from "../models/Listing.js"
import Service from "../models/Service.js"
import Job from "../models/Job.js"
import Event from "../models/Event.js"
import Report from "../models/Report.js"
import asyncHandler from "../middleware/asyncHandler.js"

// Dashboard stats
export const getStats = asyncHandler(async (req, res) => {
  const userCount = await User.countDocuments()
  const listingCount = await Listing.countDocuments()
  const serviceCount = await Service.countDocuments()
  const jobCount = await Job.countDocuments()
  const eventCount = await Event.countDocuments()
  const reportCount = await Report.countDocuments()
  const bannedCount = await User.countDocuments({ isBanned: true })

  res.json({
    userCount,
    listingCount,
    serviceCount,
    jobCount,
    eventCount,
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