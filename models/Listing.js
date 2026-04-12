import mongoose from "mongoose"

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    images: [{ type: String }],
    phone: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'Fashion',
        'Cosmetics & Hair',
        'Mobile & Accessories',
        'Vehicles',
        'Furniture',
        'Electronics',
        'Food',
        'Other'
      ],
      default: 'Other'
    },
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
)

const Listing = mongoose.model("Listing", listingSchema)
export default Listing