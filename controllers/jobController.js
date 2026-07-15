import Job from "../models/Job.js"
import asyncHandler from "../middleware/asyncHandler.js"

const sanitize = (str) => {
  if (typeof str !== 'string') return str
  return str.replace(/<[^>]*>/g, '').trim()
}

export const createJob = asyncHandler(async (req, res) => {
  const { title, phone } = req.body

  if (!title || !phone) {
    res.status(400)
    throw new Error("Title and phone are required")
  }

  const job = await Job.create({
    ...req.body,
    title: sanitize(title),
    description: sanitize(req.body.description || ''),
    company: sanitize(req.body.company || ''),
    phone: sanitize(phone),
    user: req.user._id,
  })
  res.status(201).json(job)
})

export const getJobs = asyncHandler(async (req, res) => {
  const { category } = req.query
  let filter = {}
  if (category && category !== "All") filter.category = category

  const jobs = await Job.find(filter)
    .sort({ createdAt: -1 })
    .populate("user", "name phone")
  res.json(jobs)
})

export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)

  if (!job) {
    res.status(404)
    throw new Error("Job not found")
  }

  // Allow owner OR admin
  if (job.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403)
    throw new Error("Not authorized")
  }

  await job.deleteOne()
  res.json({ message: "Job removed" })
})