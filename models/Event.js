import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    description: String,

    date: { type: Date, required: true },

    image: String,

    phone: { type: String, required: true },

    location: {
      country: { type: String, required: true },
      city: { type: String, required: true },
      area: { type: String },
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);