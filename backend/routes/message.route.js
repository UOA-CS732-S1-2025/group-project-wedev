import express from "express";
import { sendMessage, getUnreadMessageCount, updateBookingStatus } from "../controllers/message.controller.js";

const router = express.Router();

// POST /api/messages
// {
//     "senderId": "user_id",
//     "recipientId": "user_id",
//     "content": "string"
// }
router.post("/", sendMessage);
// GET /api/messages/unread-count?userId=user_id
router.get("/unread-count", getUnreadMessageCount);
// PATCH /api/messages/:id/booking-status
router.patch("/:id/booking-status", updateBookingStatus);

export default router;
