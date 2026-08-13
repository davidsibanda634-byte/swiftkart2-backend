import mongoose from "mongoose"

const eventSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    description: String,
    date:        { type: Date, required: true },
    image:       String,
    images:      [String],
    phone:       { type: String, required: true },

    location: {
      country: { type: String, required: true },
      city:    { type: String, required: true },
      area:    { type: String },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
    },
    // ── Ticketing fields ──────────────────────────────
    ticketsEnabled: {
      type:    Boolean,
      default: false,
    },

    capacity: {
      type:    Number,
      default: 0,
      // 0 = unlimited
    },
    ticketsSold: {
      type:    Number,
      default: 0,
    },
    // ── Payment details (set by organizer per event) ──
    ecocashNumber: {
      type: String,
      // e.g. "0771234567"
    },
    ecocashName: {
      type: String,
      // e.g. "David Sibanda"
    },
    upiId: {
      type: String,
      // e.g. "davidsibanda@upi"
    },
    upiName: {
      type: String,
      // e.g. "David Sibanda"
    },
    paymentInstructions: {
      type: String,
      // optional note from organizer e.g. "Send exact amount only"
    },
  },
  { timestamps: true }
)
export default mongoose.model("Event", eventSchema)