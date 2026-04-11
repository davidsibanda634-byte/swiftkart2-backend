import express from "express"
import {
  createService,
  getServices,
  deleteService
} from "../controllers/serviceController.js"
import { protect } from "../middleware/authMiddleware.js"

const router = express.Router()

router.get("/", getServices)
router.post("/", protect, createService)
router.delete("/:id", protect, deleteService)

export default router