import express from "express"
import {
  getAccommodations,
  getAccommodationById,
  createAccommodation,
  updateAccommodation,
  deleteAccommodation,
} from "../controllers/accommodationController.js"
import { protect } from "../middleware/authMiddleware.js"
import upload from "../middleware/uploadMiddleware.js"

const router = express.Router()

router.get("/", getAccommodations)
router.get("/:id", getAccommodationById)
router.post("/", protect, upload.array("images", 8), createAccommodation)
router.put("/:id", protect, updateAccommodation)
router.delete("/:id", protect, deleteAccommodation)

export default router