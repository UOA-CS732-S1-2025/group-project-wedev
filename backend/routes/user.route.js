import express from "express";
<<<<<<< HEAD
=======
import upload from '../middleware/multerUpload.js';
import { uploadProfilePicture } from '../controllers/user.controller.js';
>>>>>>> origin/main

// import { createUser, getUsers, deleteUser } from "../controllers/user.controller.js";
import { 
  getProviders, 
  searchProviders, 
  getProviderById,
  getProviderAvailability,
  updateProviderAvailability
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// router.post("/", createUser);
// router.get("/", getUsers);
// router.delete("/:id", deleteUser);

router.get("/providers", getProviders); // GET /api/providers
router.post('/providers/search', searchProviders);
router.get("/providers/:id", getProviderById);

// 新增路由 - 提供商可用性管理
router.get("/providers/:id/availability", authMiddleware, getProviderAvailability);
router.put("/providers/:id/availability", authMiddleware, updateProviderAvailability);

<<<<<<< HEAD
=======
// User profile picture upload route (for the authenticated user)
router.put(
  '/me/profile-picture', 
  authMiddleware, 
  upload.single('profilePicture'), // 'profilePicture' should match the field name in the form-data
  uploadProfilePicture
);

>>>>>>> origin/main
export default router;
