import express from "express";

// import { createUser, getUsers, deleteUser } from "../controllers/user.controller.js";
import { getProviders, searchProviders, getProviderById } from "../controllers/user.controller.js";

const router = express.Router();

// router.post("/", createUser);
// router.get("/", getUsers);
// router.delete("/:id", deleteUser);

router.get("/providers", getProviders); // GET /api/providers
router.post('/providers/search', searchProviders);
router.get("/providers/:id", getProviderById);

export default router;
