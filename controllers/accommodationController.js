import Accommodation from "../models/Accommodation.js"
import { v2 as cloudinary } from "cloudinary"

const sanitize = (str) => {
  if (typeof str !== 'string') return str
  return str.replace(/<[^>]*>/g, '').trim()
}

// GET all
export const getAccommodations = async (req, res) => {
  try {
    const accommodations = await Accommodation.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
    res.json(accommodations)
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
}

// GET single
export const getAccommodationById = async (req, res) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id)
      .populate("user", "name email")
    if (!accommodation) return res.status(404).json({ message: "Not found" })
    res.json(accommodation)
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
}

// CREATE
export const createAccommodation = async (req, res) => {
  try {
    const {
      title, description, price, priceType, listingType,
      propertyType, bedrooms, bathrooms, furnished,
      amenities, phone, availableFrom,
      'location[country]': country,
      'location[city]': city,
      'location[area]': area,
      'location[address]': address,
    } = req.body

    if (!title || !price || !phone) {
      return res.status(400).json({ message: "Title, price and phone are required" })
    }

    let images = []
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "scalablenexus/accommodations"
        })
        images.push(result.secure_url)
      }
    }

    const accommodation = await Accommodation.create({
      title: sanitize(title),
      description: sanitize(description || ''),
      price: Number(price),
      priceType,
      listingType,
      propertyType,
      bedrooms: Number(bedrooms) || 1,
      bathrooms: Number(bathrooms) || 1,
      furnished,
      amenities: amenities ? JSON.parse(amenities) : [],
      images,
      phone: sanitize(phone),
      availableFrom: availableFrom || null,
      location: {
        country: sanitize(country || ''),
        city: sanitize(city || ''),
        area: sanitize(area || ''),
        address: sanitize(address || ''),
      },
      user: req.user._id,
    })

    res.status(201).json(accommodation)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
}

// UPDATE
export const updateAccommodation = async (req, res) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id)
    if (!accommodation) return res.status(404).json({ message: "Not found" })

    // Allow owner OR admin
    const ownerId = accommodation.user?.toString()
    if (ownerId !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" })
    }

    Object.assign(accommodation, req.body)
    await accommodation.save()
    res.json(accommodation)
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
}

// DELETE
export const deleteAccommodation = async (req, res) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id)
    if (!accommodation) return res.status(404).json({ message: "Not found" })

    // Allow owner OR admin
    const ownerId = accommodation.user?.toString()
    if (ownerId !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" })
    }

    await accommodation.deleteOne()
    res.json({ message: "Deleted" })
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
}