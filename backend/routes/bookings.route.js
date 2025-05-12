import express from "express";
import { getBookingHistory } from "../controllers/bookings.controlle.js";

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// 获取当前用户的预订历史
router.get("/history", authMiddleware, getBookingHistory);

export default router;