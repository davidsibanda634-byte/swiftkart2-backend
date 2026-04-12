import Report from "../models/Report.js"
import asyncHandler from "../middleware/asyncHandler.js"

export const createReport = asyncHandler(async (req, res) => {
  const { listingId, reason, details } = req.body

  const existing = await Report.findOne({
    listing: listingId,
    reportedBy: req.user._id
  })

  if (existing) {
    res.status(400)
    throw new Error("You have already reported this listing")
  }

  const report = await Report.create({
    listing: listingId,
    reportedBy: req.user._id,
    reason,
    details
  })

  res.status(201).json({ message: "Report submitted successfully", report })
})