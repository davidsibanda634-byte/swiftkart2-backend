import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import rateLimit from "express-rate-limit"

import connectDB from "./config/db.js"

import authRoutes from "./routes/authRoutes.js"
import listingRoutes from "./routes/listingRoutes.js"
import serviceRoutes from "./routes/serviceRoutes.js"
import jobRoutes from "./routes/jobRoutes.js"
import eventRoutes from "./routes/eventRoutes.js"
import searchRoutes from "./routes/searchRoutes.js"
import reportRoutes from "./routes/reportRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import accommodationRoutes from "./routes/accommodationRoutes.js"

import { notFound, errorHandler } from "./middleware/errorMiddleware.js"

dotenv.config()
connectDB()

const app = express()

// ── CORS — only allow your frontend domains ──
app.use(cors({
  origin: [
    'https://scalablenexus.vercel.app',
    'https://swiftkart-frontend-l6wi.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  credentials: true,
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use("/uploads", express.static("uploads"))

// ── Rate limiter for auth routes — prevent brute force ──
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many attempts from this device. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
})

// ── General API limiter — prevent spam ──
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { message: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
})

// ── Apply rate limiters ──
app.use("/api/auth", authLimiter)
app.use("/api", apiLimiter)

// ── Routes ──
app.use("/api/auth", authRoutes)
app.use("/api/listings", listingRoutes)
app.use("/api/services", serviceRoutes)
app.use("/api/jobs", jobRoutes)
app.use("/api/events", eventRoutes)
app.use("/api/search", searchRoutes)
app.use("/api/reports", reportRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/accommodations", accommodationRoutes)

app.get("/", (req, res) => {
  res.send("SwiftKart API Running...")
})

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})