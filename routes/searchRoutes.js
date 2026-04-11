import express from "express"
import Listing from "../models/Listing.js"
import Service from "../models/Service.js"
import Job from "../models/Job.js"
import Event from "../models/Event.js"

const router = express.Router()

router.get("/", async (req, res) => {
  const { q } = req.query

  if (!q || q.trim() === '') {
    return res.json({ listings: [], services: [], jobs: [], events: [] })
  }

  try {
    const regex = { $regex: q, $options: "i" }

    const [listings, services, jobs, events] = await Promise.all([
      Listing.find({
        $or: [
          { title: regex },
          { description: regex },
          { 'location.city': regex },
          { 'location.area': regex }
        ]
      }).populate('user', 'name phone').sort({ createdAt: -1 }),

      Service.find({
        $or: [
          { title: regex },
          { description: regex },
          { category: regex },
          { 'location.city': regex }
        ]
      }).populate('user', 'name phone').sort({ createdAt: -1 }),

      Job.find({
        $or: [
          { title: regex },
          { description: regex },
          { company: regex },
          { 'location.city': regex }
        ]
      }).populate('user', 'name phone').sort({ createdAt: -1 }),

      Event.find({
        $or: [
          { title: regex },
          { description: regex },
          { 'location.city': regex }
        ]
      }).populate('user', 'name phone').sort({ createdAt: -1 })
    ])

    res.json({ listings, services, jobs, events })

  } catch (error) {
    res.status(500).json({ message: 'Search failed', error: error.message })
  }
})

export default router