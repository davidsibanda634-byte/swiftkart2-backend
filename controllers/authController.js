import User from "../models/User.js"
import bcrypt from "bcryptjs"
import generateToken from "../utils/generateToken.js"
import asyncHandler from "../middleware/asyncHandler.js"
import crypto from "crypto"

// Generate a unique referral code e.g. "DAVID-A3X9K"
const generateReferralCode = (name) => {
  const prefix = name.replace(/\s+/g, '').toUpperCase().slice(0, 5)
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase()
  return prefix + '-' + suffix
}

// ── Input sanitizer — strips HTML/script tags ──
const sanitize = (str) => {
  if (typeof str !== 'string') return str
  return str.replace(/<[^>]*>/g, '').trim()
}

// REGISTER
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, location } = req.body

  // ── Validate required fields ──
  if (!name || !email || !password || !phone) {
    res.status(400)
    throw new Error("Name, email, password and phone are all required")
  }

  // ── Sanitize inputs ──
  const cleanName = sanitize(name)
  const cleanEmail = sanitize(email).toLowerCase()
  const cleanPhone = sanitize(phone)

  // ── Name validation ──
  if (cleanName.length < 2 || cleanName.length > 60) {
    res.status(400)
    throw new Error("Name must be between 2 and 60 characters")
  }

  // ── Email format validation ──
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(cleanEmail)) {
    res.status(400)
    throw new Error("Please enter a valid email address")
  }

  // ── Password strength ──
  if (password.length < 6) {
    res.status(400)
    throw new Error("Password must be at least 6 characters")
  }

  if (password.length > 128) {
    res.status(400)
    throw new Error("Password is too long")
  }

  // ── Phone validation — must have digits, optional + prefix ──
  const phoneDigits = cleanPhone.replace(/\D/g, '')
  if (phoneDigits.length < 9 || phoneDigits.length > 15) {
    res.status(400)
    throw new Error("Please enter a valid phone number including country code")
  }

  // ── Check duplicate ──
  const exists = await User.findOne({ email: cleanEmail })
  if (exists) {
    res.status(400)
    throw new Error("An account with this email already exists")
  }

  // ── Sanitize location ──
  const cleanLocation = location ? {
    country: sanitize(location.country || ''),
    city: sanitize(location.city || ''),
    area: sanitize(location.area || ''),
  } : {}

  const hashedPassword = await bcrypt.hash(password, 10)

// Generate unique referral code for this new user
let referralCode
let codeExists = true
while (codeExists) {
  referralCode = generateReferralCode(cleanName)
  const existing = await User.findOne({ referralCode })
  if (!existing) codeExists = false
}

// Find referrer if a referral code was passed
let referredBy = null
const { refCode } = req.body
if (refCode) {
  const referrer = await User.findOne({ referralCode: refCode })
  if (referrer) {
    referredBy = referrer._id
    // Award 10 points to the referrer
    await User.findByIdAndUpdate(referrer._id, { $inc: { points: 10 } })
  }
}

const user = await User.create({
  name:         cleanName,
  email:        cleanEmail,
  password:     hashedPassword,
  phone:        cleanPhone,
  location:     cleanLocation,
  referralCode,
  referredBy,
})

  res.status(201).json({
  _id:          user._id,
  name:         user.name,
  email:        user.email,
  phone:        user.phone,
  location:     user.location,
  isAdmin:      user.isAdmin,
  isBanned:     user.isBanned,
  referralCode: user.referralCode,
  points:       user.points,
  token:        generateToken(user._id),
})
})

// LOGIN
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // ── Validate required fields ──
  if (!email || !password) {
    res.status(400)
    throw new Error("Email and password are required")
  }

  const cleanEmail = sanitize(email).toLowerCase()

  // ── Basic email format check ──
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(cleanEmail)) {
    res.status(400)
    throw new Error("Please enter a valid email address")
  }

  // ── Password length sanity check — prevent huge string attacks ──
  if (password.length > 128) {
    res.status(400)
    throw new Error("Invalid credentials")
  }

  const user = await User.findOne({ email: cleanEmail })

  if (user && (await bcrypt.compare(password, user.password))) {
    if (user.isBanned) {
      res.status(403)
      throw new Error("Your account has been suspended. Contact support at support@scalablenexus.co.zw")
    }

    res.json({
  _id:          user._id,
  name:         user.name,
  email:        user.email,
  phone:        user.phone,
  location:     user.location,
  isAdmin:      user.isAdmin,
  isBanned:     user.isBanned,
  referralCode: user.referralCode,
  points:       user.points,
  token:        generateToken(user._id),
})
  } else {
    res.status(401)
    throw new Error("Invalid email or password")
  }
})