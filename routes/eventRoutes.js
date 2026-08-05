import express from "express"
import {
  getEvents,

  getEventById,

  createEvent,

  updateEvent,

  deleteEvent,
} from "../controllers/eventController.js"
import { protect } from "../middleware/authMiddleware.js"

import { upload }  from "../middleware/uploadMiddleware.js"


const router = express.Router()

// Public
router.get("/",    getEvents)

router.get("/:id", getEventById)


// Protected

router.post("/",       protect, upload.array("images", 5), createEvent)


router.put("/:id",    protect, upload.array("images", 5), updateEvent)

router.delete("/:id", protect, deleteEvent)

export default router