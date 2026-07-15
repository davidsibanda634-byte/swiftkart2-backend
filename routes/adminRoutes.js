import express from "express"
import {
  getStats,
  getAllUsers,
  toggleBanUser,
  toggleAdmin,
  deleteUser,
  getAllReports,
  deleteReport,
  getAllListingsAdmin,
  deleteListingAdmin,
} from "../controllers/adminController.js"
import { protect, admin } from "../middleware/authMiddleware.js"

const router = express.Router()

router.get("/stats", protect, admin, getStats)

router.get("/users", protect, admin, getAllUsers)
router.put("/users/:id/ban", protect, admin, toggleBanUser)
router.put("/users/:id/admin", protect, admin, toggleAdmin)
router.delete("/users/:id", protect, admin, deleteUser)

router.get("/reports", protect, admin, getAllReports)
router.delete("/reports/:id", protect, admin, deleteReport)

router.get("/listings", protect, admin, getAllListingsAdmin)
router.delete("/listings/:id", protect, admin, deleteListingAdmin)

export default router