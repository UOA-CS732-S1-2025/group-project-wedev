import express from "express";
import { registerUser, loginUser, getCurrentUser, verifyEmail, updateCurrentUser } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// POST /api/auth/registers
router.post("/register", registerUser);

// POST /api/auth/login
router.post("/login", loginUser);

// GET /api/auth/me - 获取当前登录用户信息
router.get("/me", authMiddleware, getCurrentUser);

// PUT /api/auth/me - update current user profile
router.put("/me", authMiddleware, updateCurrentUser);

// GET /api/auth/verify-email
router.get("/verify-email", verifyEmail);

export default router;