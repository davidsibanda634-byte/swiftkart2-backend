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
    },

    qrData: {
      type: String,
      // base64 PNG string — used to display the QR image
    },

    qrToken: {
      type:   String,
      unique: true,
      sparse: true,
      // encoded inside QR — used for door validation
    },

    // ── Status ────────────────────────────────────────
    status: {
      type:    String,
      enum:    ["pending", "confirmed", "cancelled", "used"],
      default: "confirmed",
      // free = confirmed instantly, paid = pending until organizer confirms
    },

    scannedAt: {
      type: Date,
    },

    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
    },

    // ── Payment ───────────────────────────────────────
    paymentMethod: {
      type:    String,
      enum:    ["free", "ecocash", "upi", "whatsapp", "cash_at_door"],

      default: "free",
    },
    paymentReference: {
      type: String,
      // EcoCash transaction ref e.g. "FT26123ABC456"
      // UPI UTR number e.g. "427612345678"
    },
    paymentProofNote: {
      type: String,
      // optional note from buyer e.g. "Paid at 2pm, name Tafadzwa"
    },
  },
  { timestamps: true }
)

export default mongoose.model("Ticket", ticketSchema)