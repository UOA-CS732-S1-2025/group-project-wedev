import express from "express";
import { createUser, getUsers, deleteUser, getProviders, searchProviders } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/", createUser);
router.get("/", getUsers);
router.delete("/:id", deleteUser);
router.get("/providers", getProviders); // GET /api/providers
router.post("/search", searchProviders); // POST /api/search
router.post('/providers/search', searchProviders);

export default router;
