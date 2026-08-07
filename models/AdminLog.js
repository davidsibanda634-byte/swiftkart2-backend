import mongoose from "mongoose"

const adminLogSchema = new mongoose.Schema(
  {
    // Who performed the action
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    adminName: {
      type: String,
      required: true,
      // Snapshot of name at time of action so logs stay
      // readable even if the admin account is later deleted
    },

    // What they did
    action: {
      type: String,
      required: true,
      enum: [
        "ban_user",
        "unban_user",
        "make_admin",
        "remove_admin",
        "verify_user",
        "unverify_user",
        "delete_user",
        "delete_listing",
        "delete_service",
        "delete_job",
        "delete_event",
        "delete_accommodation",
        "delete_report",
        "dismiss_report",
      ],
    },

    // What it targeted
    targetType: {
      type: String,
      enum: ["User", "Listing", "Service", "Job", "Event", "Accommodation", "Report"],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    // Human-readable summary e.g. "Banned Tinashe Moyo"
    details: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
)

export default mongoose.model("AdminLog", adminLogSchema)