import express from "express";
import { submitReport } from "../controllers/report.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// POST /api/reports
router.post("/", authMiddleware, submitReport);

export default router;
