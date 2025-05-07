import express from "express";
import { registerUser, loginUser, getCurrentUser, verifyEmail  } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// POST /api/auth/registers
router.post("/register", registerUser);

// POST /api/auth/login
router.post("/login", loginUser);

// GET /api/auth/me - 获取当前登录用户信息
router.get("/me", authMiddleware, getCurrentUser);

// GET /api/auth/verify-email
router.get("/verify-email", verifyEmail);

export default router;