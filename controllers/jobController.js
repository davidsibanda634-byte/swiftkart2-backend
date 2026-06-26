import Job from "../models/Job.js"
import asyncHandler from "../middleware/asyncHandler.js"

export const createJob = asyncHandler(async (req, res) => {
  const job = await Job.create({
    ...req.body,
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

  if (job.user.toString() !== req.user._id.toString()) {
    res.status(401)
    throw new Error("Not authorized")
  }

  await job.deleteOne()
  res.json({ message: "Job removed" })
})