import express from "express"
import dotenv from "dotenv"
import cors from "cors"

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

app.use(cors())
app.use(express.json())

app.use("/uploads", express.static("uploads"))

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