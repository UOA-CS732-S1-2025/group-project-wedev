import express from "express";
import { registerUser, loginUser, getCurrentUser, verifyEmail, updateCurrentUser } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// POST /api/auth/registers
router.post("/register", registerUser);

// POST /api/auth/login
router.post("/login", loginUser);

// GET /api/auth/me - Get current logged-in user information
router.get("/me", authMiddleware, getCurrentUser);

// PUT /api/auth/me - update current user profile
router.put("/me", authMiddleware, updateCurrentUser);

// PUT /api/auth/me/become-provider - specific endpoint for role change
router.put("/me/become-provider", authMiddleware, (req, res) => {
  // Force the role to provider before passing to updateCurrentUser
  req.body.role = 'provider';
  updateCurrentUser(req, res);
});

// GET /api/auth/verify-email
router.get("/verify-email", verifyEmail);

export default router;