import mongoose from "mongoose"

const ticketTypeSchema = new mongoose.Schema(
  {
    event: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Event",
      required: true,
    },

    // ── Type identity ─────────────────────────────────
    name: {
      type:     String,
      required: true,
      // e.g. "General", "VIP", "Student", "Early Bird"
    },

    description: {
      type: String,
      // e.g. "Includes food and drinks"
    },

    // ── Pricing ───────────────────────────────────────
    price: {
      type:    Number,
      default: 0,
      // 0 = free ticket
    },

    currency: {
      type:    String,
      default: "USD",
      enum:    ["USD", "ZWL"],
    },

    // ── Capacity ──────────────────────────────────────
    quantity: {
      type:    Number,
      default: 0,
      // 0 = unlimited for this type
    },

    sold: {
      type:    Number,
      default: 0,
      // incremented on every confirmed booking
    },

    // ── Availability ──────────────────────────────────
    isActive: {
      type:    Boolean,
      default: true,
      // organizer can pause sales for a type
    },

    // ── Sales window ──────────────────────────────────
    salesStart: {
      type: Date,
      // optional — tickets not available before this date
    },

    salesEnd: {
      type: Date,
      // optional — tickets not available after this date
    },
  },
  { timestamps: true }
)

// ── Virtual: remaining tickets ────────────────────────
ticketTypeSchema.virtual("remaining").get(function () {
  if (this.quantity === 0) return null // unlimited
  return this.quantity - this.sold
})

// ── Virtual: isSoldOut ────────────────────────────────
ticketTypeSchema.virtual("isSoldOut").get(function () {
  if (this.quantity === 0) return false // unlimited never sold out
  return this.sold >= this.quantity
})

ticketTypeSchema.set("toJSON",   { virtuals: true })
ticketTypeSchema.set("toObject", { virtuals: true })

export default mongoose.model("TicketType", ticketTypeSchema)