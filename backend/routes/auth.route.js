import express from "express";
import { registerUser, loginUser, getCurrentUser, verifyEmail  } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// POST /register
router.post("/register", registerUser);

// POST /login
router.post("/login", loginUser);

// GET /me - 获取当前登录用户信息
router.get("/me", authMiddleware, getCurrentUser);

router.get("/verify-email", verifyEmail);

export default router;