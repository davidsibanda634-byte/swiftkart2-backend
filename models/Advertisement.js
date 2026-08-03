import mongoose from "mongoose"

const advertisementSchema = new mongoose.Schema(
  {
    badge: { type: String, default: "" },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: "" },
    image: { type: String, required: true },
    buttonText: { type: String, default: "" },
    linkUrl: { type: String, default: "" },
    accentColor: { type: String, default: "#00C896" },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

const Advertisement = mongoose.model("Advertisement", advertisementSchema)
export default Advertisement