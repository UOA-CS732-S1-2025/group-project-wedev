import express from "express";
import { getUserConversations, getMessagesByConversationId, markConversationAsRead, findOrCreateConversation  } from "../controllers/conversation.controller.js";

const router = express.Router();

// GET /api/conversations?userId=user_id  
router.get("/", getUserConversations);
// GET /api/conversations/:id/messages  :id => conversation_id
router.get("/:id/messages", getMessagesByConversationId);
// PUT /api/conversations/:id/read   :id => conversation_id
// {
//     "userId": "user_id"
// }
router.put("/:id/read", markConversationAsRead);

// POST /api/conversations/find-or-create
// Body: { "userId1": "current_user_id", "userId2": "provider_user_id" }
router.post("/find-or-create", findOrCreateConversation);

export default router;
