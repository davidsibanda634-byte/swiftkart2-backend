import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  }

  if (!token) {
    return res.status(401).json({ message: "No token, not authorized" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select("-password")

    if (!req.user) {
      return res.status(401).json({ message: "User not found" })
    }

    if (req.user.isBanned) {
      return res.status(403).json({ message: "Your account has been suspended. Contact support." })
    }

    // Fire-and-forget — don't await, so this never slows down the actual request
    User.findByIdAndUpdate(req.user._id, { lastActiveAt: Date.now() }).catch(() => {})

    next()
  } catch (error) {
    return res.status(401).json({ message: "Token invalid, not authorized" })
  }
}

export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next()
  } else {
    res.status(403).json({ message: "Not authorized as admin" })
  }
}