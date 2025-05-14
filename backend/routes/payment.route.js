import express from "express";
import { createPayment, updatePayment, getPaymentByBookingId} from "../controllers/payment.controller.js";
import { authMiddleware  } from "../middleware/auth.middleware.js";

const router = express.Router();

// 客户发起支付
router.post("/", authMiddleware , createPayment);

router.patch("/:id", authMiddleware, updatePayment);

router.get("/booking/:bookingId", authMiddleware, getPaymentByBookingId);
export default router;
