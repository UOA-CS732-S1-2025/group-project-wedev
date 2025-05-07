import express from "express";
import { submitReport } from "../controllers/report.controller.js";

const router = express.Router();

// POST /api/reports
router.post("/", submitReport);

export default router;
