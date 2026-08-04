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


      // organizer toggles this on when creating the event


    },




    capacity: {


      type:    Number,


      default: 0,


      // 0 = unlimited, any other number = max attendees


    },




    ticketsSold: {


      type:    Number,


      default: 0,


      // running total across all ticket types


    },

  },
  { timestamps: true }
)

export default mongoose.model("Event", eventSchema)