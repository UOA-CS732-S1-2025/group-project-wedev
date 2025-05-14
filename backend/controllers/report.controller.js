import Report from "../models/report.model.js";

export const submitReport = async (req, res) => {
  try {
    const { userId, subject, description, category } = req.body;

    if (!userId || !subject || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newReport = await Report.create({
      user: userId,
      subject,
      description,
      category: category || "other", // 可选字段
    });

    res.status(201).json({
      message: "Report submitted successfully",
      report: newReport,
    });
  } catch (error) {
    console.error("Report submission error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
