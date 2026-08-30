import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: { type: String, required: true },

    phone: {
      type: String,
      required: true,
    },

    location: {
      country: { type: String },
      city: { type: String },
      area: { type: String },
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },

    isBanned: {
      type: Boolean,
      default: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    referralCode: {
  type:   String,
  unique: true,
  sparse: true,
  // e.g. "DAVID123" — generated on register
},

referredBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref:  'User',
  // the user who referred this person
},

points: {
  type:    Number,
  default: 0,
  // earned by referring new users — 10 points per referral
},
  },
  { timestamps: true }
)

export default mongoose.model("User", userSchema)