import Report from "../../models/report.model.js";

// Get all reports
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("user", "username email")
      .populate("reporter", "username email")
      .sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reports" });
  }
};

// Get a single report
export const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("user", "username email");
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.status(200).json(report);
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve report" });
  }
};

// Update report (status, admin notes, reviewer, resolution time)
export const updateReport = async (req, res) => {
  try {
    const updates = {
      ...req.body,
      reviewedBy: req.body.reviewedBy || null,
    };

    if (updates.status === "resolved") {
      updates.resolvedAt = new Date();
    }

    const updated = await Report.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    if (!updated) return res.status(404).json({ message: "Report not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update report" });
  }
};

// Delete report
export const deleteReport = async (req, res) => {
  try {
    const deleted = await Report.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Report not found" });
    res.status(200).json({ message: "Report deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete report" });
  }
};
