import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    images: [{ type: String }],
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

// IMPORTANT: default export
const Listing = mongoose.model("Listing", listingSchema);

export default Listing;