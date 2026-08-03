import express from "express"
import {
  getStats,
  getAllUsers,
  toggleBanUser,
  toggleAdmin,
  toggleVerifyUser,
  deleteUser,
  getAllReports,
  deleteReport,
  getAllListingsAdmin,
  deleteListingAdmin,
  getAllJobsAdmin,
  deleteJobAdmin,
  getAllServicesAdmin,
  deleteServiceAdmin,
  getAllEventsAdmin,
  deleteEventAdmin,
  getAllAccommodationsAdmin,
  deleteAccommodationAdmin,
  getAllCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllAdvertisementsAdmin,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
} from "../controllers/adminController.js"
import { protect, admin } from "../middleware/authMiddleware.js"

const router = express.Router()

router.get("/stats", protect, admin, getStats)

router.get("/users", protect, admin, getAllUsers)
router.put("/users/:id/ban", protect, admin, toggleBanUser)
router.put("/users/:id/admin", protect, admin, toggleAdmin)
router.put("/users/:id/verify", protect, admin, toggleVerifyUser)
router.delete("/users/:id", protect, admin, deleteUser)

router.get("/reports", protect, admin, getAllReports)
router.delete("/reports/:id", protect, admin, deleteReport)

router.get("/listings", protect, admin, getAllListingsAdmin)
router.delete("/listings/:id", protect, admin, deleteListingAdmin)

router.get("/jobs", protect, admin, getAllJobsAdmin)
router.delete("/jobs/:id", protect, admin, deleteJobAdmin)

router.get("/services", protect, admin, getAllServicesAdmin)
router.delete("/services/:id", protect, admin, deleteServiceAdmin)

router.get("/events", protect, admin, getAllEventsAdmin)
router.delete("/events/:id", protect, admin, deleteEventAdmin)

router.get("/accommodations", protect, admin, getAllAccommodationsAdmin)
router.delete("/accommodations/:id", protect, admin, deleteAccommodationAdmin)

router.get("/categories", protect, admin, getAllCategoriesAdmin)
router.post("/categories", protect, admin, createCategory)
router.put("/categories/:id", protect, admin, updateCategory)
router.delete("/categories/:id", protect, admin, deleteCategory)

router.get("/advertisements", protect, admin, getAllAdvertisementsAdmin)
router.post("/advertisements", protect, admin, createAdvertisement)
router.put("/advertisements/:id", protect, admin, updateAdvertisement)
router.delete("/advertisements/:id", protect, admin, deleteAdvertisement)

export default router