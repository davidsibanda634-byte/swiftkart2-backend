import Listing from "../models/Listing.js"
import asyncHandler from "../middleware/asyncHandler.js"

const sanitize = (str) => {
  if (typeof str !== 'string') return str
  return str.replace(/<[^>]*>/g, '').trim()
}

// CREATE
export const createListing = asyncHandler(async (req, res) => {
  const imagePaths = req.files?.map(file => file.path) || []

  const { title, description, price, category, phone } = req.body

  if (!title || !price || !phone) {
    res.status(400)
    throw new Error("Title, price and phone are required")
  }

  const listing = await Listing.create({
    ...req.body,
    title: sanitize(title),
    description: sanitize(description || ''),
    category: sanitize(category || 'Other'),
    phone: sanitize(phone),
    images: imagePaths,
    user: req.user._id,
  })
  res.status(201).json(listing)
})

// GET ALL
export const getListings = asyncHandler(async (req, res) => {
  const { city, search, category } = req.query
  let filter = {}
  if (city) filter["location.city"] = city
  if (search) filter.$text = { $search: search }
  if (category && category !== 'All') filter.category = category
  const listings = await Listing.find(filter)
    .sort({ createdAt: -1 })
    .populate("user", "name phone")
  res.json(listings)
})

// GET ONE
export const getListingById = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate("user")
  if (!listing) {
    res.status(404)
    throw new Error("Listing not found")
  }
  res.json(listing)
})

// UPDATE
export const updateListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id)
  if (!listing) {
    res.status(404)
    throw new Error("Listing not found")
  }
  // Allow owner OR admin
  if (listing.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403)
    throw new Error("Not authorized")
  }
  const updated = await Listing.findByIdAndUpdate(
    req.params.id, req.body, { new: true }
  )
  res.json(updated)
})

// DELETE
export const deleteListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id)
  if (!listing) {
    res.status(404)
    throw new Error("Listing not found")
  }
  // Allow owner OR admin
  if (listing.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403)
    throw new Error("Not authorized")
  }
  await listing.deleteOne()
  res.json({ message: "Listing removed" })
})