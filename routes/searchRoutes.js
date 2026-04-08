import express from "express";
import Listing from "../models/Listing.js";
import Service from "../models/Service.js";
import Job from "../models/Job.js";
import Event from "../models/Event.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { q } = req.query;

  const listings = await Listing.find({ $text: { $search: q } });
  const services = await Service.find({ title: { $regex: q, $options: "i" } });
  const jobs = await Job.find({ title: { $regex: q, $options: "i" } });
  const events = await Event.find({ title: { $regex: q, $options: "i" } });

  res.json({
    listings,
    services,
    jobs,
    events,
  });
});

export default router;