import Event from "../models/Event.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const createEvent = asyncHandler(async (req, res) => {
  const event = await Event.create({
    ...req.body,
    user: req.user._id,
  });

  res.status(201).json(event);
});

export const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find()
    .sort({ createdAt: -1 })
    .populate("user", "name phone");

  res.json(events);
});