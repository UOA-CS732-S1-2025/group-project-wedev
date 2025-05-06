import express from "express";
import {
  getAllReports,
  getReportById,
  updateReport,
  deleteReport,
} from "../../controllers/admin/report.admin.controller.js";

const router = express.Router();
//GET    api/admin/reports
router.get("/", getAllReports);
//GET    api/admin/reports/report_id
router.get("/:id", getReportById);
//PUT    api/admin/reports/report_id
// {
//     "description": "XXXX"
// }
router.put("/:id", updateReport);
//DELETE  api/admin/reports/report_id
router.delete("/:id", deleteReport);

export default router;
//Add identity authentication and administrator authority verification
