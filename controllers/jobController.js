import Job from "../models/Job.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const createJob = asyncHandler(async (req, res) => {
  const job = await Job.create({
    ...req.body,
    user: req.user._id,
  });

  res.status(201).json(job);
});

export const getJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find()
    .sort({ createdAt: -1 })
    .populate("user", "name phone");

  res.json(jobs);
});