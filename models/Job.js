import mongoose from "mongoose"

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    category: {
      type: String,
      enum: ["Internship", "Part-Time", "Full-Time", "Freelance", "Volunteer", "Other"],
      default: "Other",
    },

    company: String,

    description: String,

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
)

export default mongoose.model("Job", jobSchema)