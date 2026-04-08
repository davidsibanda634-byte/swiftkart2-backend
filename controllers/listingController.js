import Listing from "../models/Listing.js";
import asyncHandler from "../middleware/asyncHandler.js";

// CREATE
export const createListing = asyncHandler(async (req, res) => {
  const imagePaths = req.files?.map(file => file.path) || [];

  const listing = await Listing.create({
    ...req.body,
    images: imagePaths,
    user: req.user._id,
  });

  res.status(201).json(listing);
});

// GET ALL
export const getListings = asyncHandler(async (req, res) => {
  const { city, search } = req.query;

  let filter = {};

  if (city) filter["location.city"] = city;

  if (search) {
    filter.$text = { $search: search };
  }

  const listings = await Listing.find(filter)
    .sort({ createdAt: -1 })
    .populate("user", "name phone");

  res.json(listings);
});

// GET ONE
export const getListingById = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate("user");

  if (!listing) {
    res.status(404);
    throw new Error("Listing not found");
  }

  res.json(listing);
});

// UPDATE
export const updateListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    res.status(404);
    throw new Error("Listing not found");
  }

  if (listing.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized");
  }

  const updated = await Listing.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updated);
});

// DELETE
export const deleteListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    res.status(404);
    throw new Error("Listing not found");
  }

  if (listing.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized");
  }

  await listing.deleteOne();

  res.json({ message: "Listing removed" });
});