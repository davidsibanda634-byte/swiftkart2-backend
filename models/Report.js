import mongoose from "mongoose"

const reportSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    reason: {
      type: String,
      required: true,
      enum: [
        'Scam or fraud',
        'Fake listing',
        'Inappropriate content',
        'Wrong price',
        'Duplicate listing',
        'Other'
      ]
    },
    details: {
      type: String
    }
  },
  { timestamps: true }
)

export default mongoose.model("Report", reportSchema)