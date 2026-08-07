import AdminLog from "../models/AdminLog.js"

/**
 * Fire-and-forget audit logger.
 * Called at the end of every mutating admin controller function.
 * Failures are swallowed so they never block the actual admin action.
 *
 * @param {Object} req         - Express request (provides req.user)
 * @param {string} action      - One of the AdminLog action enum values
 * @param {string} targetType  - "User" | "Listing" | "Service" | "Job" | "Event" | "Accommodation" | "Report"
 * @param {*}      targetId    - MongoDB ObjectId of the affected document
 * @param {string} details     - Human-readable summary e.g. "Banned Tinashe Moyo"
 */
export const logAction = async (req, action, targetType, targetId, details = "") => {
  try {
    await AdminLog.create({
      admin:     req.user._id,
      adminName: req.user.name,
      action,
      targetType,
      targetId,
      details,
    })
  } catch (err) {
    // Deliberately silent — a broken audit trail is annoying,
    // a broken ban button is worse
    console.error("[logAction] Failed to write audit log:", err.message)
  }
}