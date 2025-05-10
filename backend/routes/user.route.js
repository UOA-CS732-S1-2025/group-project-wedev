import express from "express";

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

export default router;
