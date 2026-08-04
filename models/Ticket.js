import mongoose from "mongoose"

const ticketSchema = new mongoose.Schema(
  {
    event: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Event",
      required: true,
    },

    ticketType: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "TicketType",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
      // optional — allows guest bookings without an account
    },

    // ── Attendee details ──────────────────────────────
    attendeeName: {
      type:     String,
      required: true,
    },

    attendeePhone: {
      type:     String,
      required: true,
    },

    // ── Ticket identity ───────────────────────────────
    ticketNumber: {
      type:   String,
      unique: true,
      // generated e.g. "SN-2026-A7X9K"
    },

    qrData: {
      type: String,
      // base64 PNG string — used to display the QR image
    },

    qrToken: {
      type:   String,
      unique: true,
      sparse: true,
      // the string encoded inside the QR — used for validation
      // scanner reads this, sends to backend, backend looks it up
    },

    // ── Status ────────────────────────────────────────
    status: {
      type:    String,
      enum:    ["pending", "confirmed", "cancelled", "used"],
      default: "confirmed",
      // free tickets auto-confirmed, paid tickets start as pending
    },

    scannedAt: {
      type: Date,
      // set when QR is scanned at the door
    },

    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
      // organizer or staff member who scanned
    },

    paymentMethod: {
      type:    String,
      enum:    ["free", "whatsapp", "cash_at_door"],
      default: "free",
    },
  },
  { timestamps: true }
)

export default mongoose.model("Ticket", ticketSchema)