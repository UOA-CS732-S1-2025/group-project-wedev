import express from "express";
import { sendMessage, getUnreadMessageCount  } from "../controllers/message.controller.js";

const router = express.Router();

// POST /api/messages
// {
//     "senderId": "user_id",
//     "recipientId": "user_id",
//     "content": "string"
// }
router.post("/", sendMessage);
// GET /api/messages/unread-count?userId=user_id
router.get("/unread-count?userId=user_id", getUnreadMessageCount);


export default router;
