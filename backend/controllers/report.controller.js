import Report from "../models/report.model.js";

export const submitReport = async (req, res) => {
  try {
    // reporterId will be taken from authenticated user (req.userId)
    // reportedUserId is the ID of the user being reported (e.g., providerId from frontend)
    const { reportedUserId, subject, description, category, bookingId } = req.body;
    const reporterId = req.userId; // 从 req.userId 获取，由 authMiddleware 设置

    if (!reporterId) {
      // 理论上，如果 authMiddleware 正常工作，这里不会被触发，因为中间件会提前返回 401
      return res.status(401).json({ success: false, message: "Unauthorized. User ID not found in request." });
    }

    if (!reportedUserId || !subject || !description) {
      return res.status(400).json({ success: false, message: "Missing required fields: reportedUserId, subject, and description are required." });
    }

    const newReport = await Report.create({
      user: reportedUserId,      // The user being reported
      reporter: reporterId,      // The user submitting the report
      subject,
      description,
      category: category || "other",
      booking: bookingId || undefined, // Add bookingId if provided
      status: "pending", // Default status
    });

    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      report: newReport,
    });
  } catch (error) {
    console.error("Report submission error:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};
