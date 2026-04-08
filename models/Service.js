import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    description: String,

    pricePerHour: {
      type: Number,
      min: 0,
    },

    category: String,

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

export default mongoose.model("Service", serviceSchema);