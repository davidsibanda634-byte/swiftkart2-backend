import mongoose from "mongoose"

const accommodationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    priceType: {
      type: String,
      enum: ['per month', 'per week', 'total price'],
      default: 'per month'
    },
    listingType: {
      type: String,
      enum: ['For Rent', 'For Sale'],
      required: true,
      default: 'For Rent'
    },
    propertyType: {
      type: String,
      enum: ['Room', 'Studio', 'Apartment', 'House', 'Cottage', 'Flat', 'Other'],
      default: 'Room'
    },
    bedrooms: { type: Number, default: 1 },
    bathrooms: { type: Number, default: 1 },
    furnished: {
      type: String,
      enum: ['Furnished', 'Semi-Furnished', 'Unfurnished'],
      default: 'Furnished'
    },
    amenities: [{ type: String }],
    images: [{ type: String }],
    phone: { type: String, required: true },
    available: { type: Boolean, default: true },
    availableFrom: { type: Date },
    location: {
      country: { type: String, required: true },
      city: { type: String, required: true },
      area: { type: String },
      address: { type: String },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
)

const Accommodation = mongoose.model("Accommodation", accommodationSchema)
export default Accommodation