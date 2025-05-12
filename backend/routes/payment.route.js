import express from "express";
import { createPayment } from "../controllers/payment.controller.js";
import { authMiddleware  } from "../middleware/auth.middleware.js";

const router = express.Router();

// 客户发起支付
router.post("/", authMiddleware , createPayment);

export default router;
